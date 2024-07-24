using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Common;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using Sdcb.DashScope;
using System.ClientModel;
using System.ClientModel.Primitives;
using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using DBChatMessage = Chats.BE.DB.ChatMessage;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats"), Authorize]
public class ConversationController(ChatsDB db, CurrentUser currentUser, ILogger<ConversationController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ConversationRequest request,
        [FromServices] ConversationFactory conversationFactory,
        CancellationToken cancellationToken)
    {
        ChatModel? cm = await db.ChatModels
            .Where(x => x.Id == request.ModelId && x.Enabled)
            .Include(x => x.ModelKeys)
            .FirstOrDefaultAsync(x => x.Id == request.ModelId, cancellationToken: cancellationToken);
        if (cm == null)
        {
            return BadRequestMessage("The Model does not exist or access is denied.");
        }

        JsonPriceConfig priceConfig = JsonSerializer.Deserialize<JsonPriceConfig>(cm.PriceConfig)!;

        var miscInfo = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => new
            {
                UserModels = x.UserModel!,
                UserBalance = x.UserBalance!,
                ThisChat = db.Chats.Single(x => x.Id == request.ChatId && x.UserId == currentUser.Id)
            })
            .SingleAsync(cancellationToken);
        List<JsonTokenBalance> tokenBalances = JsonSerializer.Deserialize<List<JsonTokenBalance>>(miscInfo.UserModels.Models)!;
        int tokenBalanceIndex = tokenBalances.FindIndex(x => x.ModelId == request.ModelId);
        JsonTokenBalance? tokenBalance = tokenBalances[tokenBalanceIndex];
        if (tokenBalance == null)
        {
            return BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (!tokenBalance.Enabled)
        {
            return BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (tokenBalance.Expires != "-" && DateTime.Parse(tokenBalance.Expires) < DateTime.UtcNow)
        {
            return BadRequestMessage("Subscription has expired");
        }
        if (tokenBalance.Counts == "0" && tokenBalance.Tokens == "0" && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
        {
            return BadRequestMessage("Insufficient balance");
        }

        Dictionary<Guid, MessageLiteDto> existingMessages = await db.ChatMessages
            .Where(x => x.ChatId == request.ChatId && x.UserId == currentUser.Id)
            .Select(x => new MessageLiteTemp()
            {
                Id = x.Id,
                Content = x.Messages,
                Role = x.Role,
                ParentId = x.ParentId,
            })
            .ToAsyncEnumerable()
            .Select(x => x.ToDto())
            .ToDictionaryAsync(x => x.Id, x => x, cancellationToken);
        MessageLiteDto? systemMessage = existingMessages
            .Values
            .Where(x => x.Role == DBConversationRoles.System)
            .FirstOrDefault();
        // insert system message if it doesn't exist
        if (systemMessage == null)
        {
            if (request.UserModelConfig.Prompt == null)
            {
                return BadRequestMessage("Prompt is required for the first message");
            }

            DBChatMessage toBeInsert = new()
            {
                Id = Guid.NewGuid(),
                ChatId = request.ChatId,
                UserId = currentUser.Id,
                Role = DBConversationRoles.System,
                Messages = MessageContentDto.FromText(request.UserModelConfig.Prompt).ToJson(),
                CreatedAt = DateTime.UtcNow,
            };
            db.ChatMessages.Add(toBeInsert);

            systemMessage = new MessageLiteDto
            {
                Id = toBeInsert.Id,
                Content = MessageContentDto.FromText(request.UserModelConfig.Prompt),
                Role = DBConversationRoles.System,
                ParentId = null,
            };

            miscInfo.ThisChat.Title = request.UserMessage.Text[..Math.Min(30, request.UserMessage.Text.Length)];
        }
        else
        {
            request = request with { UserModelConfig = JsonSerializer.Deserialize<ModelConfig>(miscInfo.ThisChat.UserModelConfig)! };
        }

        List<OpenAIChatMessage> messageToSend =
        [
            new SystemChatMessage(systemMessage.Content.Text),
            ..GetMessageTree(existingMessages, request.MessageId),
        ];

        MessageLiteDto userMessage = GetUserMessage(request, existingMessages, messageToSend);

        ConversationSegment lastSegment = new() { TextSegment = "", InputTokenCount = 0, OutputTokenCount = 0 };
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        StringBuilder responseText = new();
        UserModelBalanceCost cost = null!;
        Stopwatch sw = Stopwatch.StartNew();
        try
        {
            UserModelBalanceCalculator calculator = new(tokenBalance, miscInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);

            using ConversationService s = conversationFactory.CreateConversationService(cm);
            await foreach (ConversationSegment seg in s.ChatStreamed(messageToSend, request.UserModelConfig, currentUser, cancellationToken))
            {
                lastSegment = seg;
                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.InputTokenCount, seg.OutputTokenCount, priceConfig);
                if (cost.IsSufficient)
                {
                    cost = currentCost;
                }
                else
                {
                    // insufficient balance, use previous cost
                    responseText.Append("\n⚠Insufficient balance - 余额不足!");
                    break;
                }

                if (seg.TextSegment == string.Empty) continue;
                await YieldResponse(new() { Result = seg.TextSegment, Success = true });
                responseText.Append(seg.TextSegment);
            }
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
            responseText.Append(e.Message);
            await YieldResponse(new SseResponseLine { Result = e.Message, Success = true });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
            string errorTextToResponse = "\n⚠Error in conversation - 对话出错!";
            responseText.Append(errorTextToResponse);
            await YieldResponse(new SseResponseLine { Result = errorTextToResponse, Success = true });
        }

        int elapsedMs = (int)sw.ElapsedMilliseconds;

        // success
        // insert new assistant message
        DBChatMessage assistantMessage = new()
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            UserId = currentUser.Id,
            Role = DBConversationRoles.Assistant,
            Messages = MessageContentDto.FromText(responseText.ToString()).ToJson(),
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessage.Id,
            Duration = elapsedMs,
            InputTokens = lastSegment.InputTokenCount,
            OutputTokens = lastSegment.OutputTokenCount,
            InputPrice = cost.InputTokenPrice,
            OutputPrice = cost.OutputTokenPrice,
            ChatModelId = cm.Id,
        };
        db.ChatMessages.Add(assistantMessage);

        UpdateBalance(miscInfo.UserModels, miscInfo.UserBalance, tokenBalances, tokenBalanceIndex, tokenBalance, cost, assistantMessage.Id);
        
        await db.SaveChangesAsync(cancellationToken);

        return new EmptyResult();
    }

    private BadRequestObjectResult BadRequestMessage(string message)
    {
        return BadRequest(new { message });
    }

    private MessageLiteDto GetUserMessage(ConversationRequest request, Dictionary<Guid, MessageLiteDto> existingMessages, List<OpenAIChatMessage> messageToSend)
    {
        // new user message
        if (request.MessageId != null && existingMessages.TryGetValue(request.MessageId.Value, out MessageLiteDto? parentMessage) && parentMessage.Role == DBConversationRoles.User)
        {
            // existing user message
            return existingMessages[request.MessageId!.Value];
        }

        // insert new user message
        DBChatMessage dbUserMessage = new()
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            UserId = currentUser.Id,
            Role = DBConversationRoles.User,
            Messages = request.UserMessage.ToJson(),
            CreatedAt = DateTime.UtcNow,
            ParentId = request.MessageId,
        };
        db.ChatMessages.Add(dbUserMessage);
        MessageLiteDto userMessage = new()
        {
            Id = dbUserMessage.Id,
            Content = request.UserMessage,
            Role = dbUserMessage.Role,
            ParentId = dbUserMessage.ParentId,
        };
        messageToSend.Add(ContentToMessage(userMessage));
        return userMessage;
    }

    private void UpdateBalance(UserModel userModel, UserBalance userBalance, List<JsonTokenBalance> userModelConfigs, int userModelConfigIndex, JsonTokenBalance userModelConfig, UserModelBalanceCost cost, Guid assistantMessageId)
    {
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            userModelConfigs[userModelConfigIndex] = userModelConfig;
            userModel.Models = JsonSerializer.Serialize(userModelConfigs);
        }
        if (cost.CostBalance > 0)
        {
            db.BalanceLogs.Add(new()
            {
                Id = Guid.NewGuid(),
                UserId = currentUser.Id,
                CreatedAt = DateTime.UtcNow,
                CreateUserId = currentUser.Id,
                MessageId = assistantMessageId,
                Value = cost.CostBalance,
                Type = (int)BalanceLogType.Cost,
                UpdatedAt = DateTime.UtcNow,
            });
            userBalance.Balance -= cost.CostBalance;
        }
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data:"u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lfu8 = "\n"u8.ToArray();
    private readonly static JsonSerializerOptions JsonSerializerOptions = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    private async Task YieldResponse(SseResponseLine line)
    {
        await Response.Body.WriteAsync(dataU8);
        await Response.Body.WriteAsync(JsonSerializer.SerializeToUtf8Bytes(line, JsonSerializerOptions));
        await Response.Body.WriteAsync(lfu8);
        await Response.Body.FlushAsync();
    }

    static IEnumerable<OpenAIChatMessage> GetMessageTree(Dictionary<Guid, MessageLiteDto> existingMessages, Guid? fromParentId)
    {
        LinkedList<MessageLiteDto> line = [];
        Guid? currentParentId = fromParentId;
        while (currentParentId != null)
        {
            if (!existingMessages.ContainsKey(currentParentId.Value))
            {
                break;
            }
            line.AddFirst(existingMessages[currentParentId.Value]);
            currentParentId = existingMessages[currentParentId.Value].ParentId;
        }
        return line.Select(ContentToMessage);
    }

    static OpenAIChatMessage ContentToMessage(MessageLiteDto dto)
    {
        List<ChatMessageContentPart> parts = [];
        if (dto.Content.Image != null)
        {
            parts.AddRange(dto.Content.Image.Select(x => ChatMessageContentPart.CreateImageMessageContentPart(new Uri(x))));
        }
        parts.Add(ChatMessageContentPart.CreateTextMessageContentPart(dto.Content.Text));

        return dto.Role switch
        {
            DBConversationRoles.System => new SystemChatMessage(dto.Content.Text),
            DBConversationRoles.User => new UserChatMessage(parts),
            DBConversationRoles.Assistant => new AssistantChatMessage(dto.Content.Text),
            _ => throw new NotImplementedException(),
        };
    }
}