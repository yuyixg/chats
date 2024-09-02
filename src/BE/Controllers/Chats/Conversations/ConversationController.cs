using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using Sdcb.DashScope;
using System.ClientModel;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats"), Authorize]
public class ConversationController(ChatsDB db, CurrentUser currentUser, ILogger<ConversationController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ConversationRequest request,
        [FromServices] BalanceService balanceService,
        [FromServices] ConversationFactory conversationFactory,
        CancellationToken cancellationToken)
    {
        ChatModel? cm = await db.ChatModels
            .Where(x => x.Id == request.ModelId && x.Enabled)
            .Include(x => x.ModelKeys)
            .FirstOrDefaultAsync(x => x.Id == request.ModelId, cancellationToken: cancellationToken);
        if (cm == null)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }

        JsonPriceConfig priceConfig = JsonSerializer.Deserialize<JsonPriceConfig>(cm.PriceConfig)!;

        var miscInfo = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => new
            {
                UserModels = x.UserModel!,
                UserBalance = x.UserBalance!,
                ThisChat = db.Conversations.Single(x => x.Id == request.ConversationId && x.UserId == currentUser.Id)
            })
            .SingleAsync(cancellationToken);
        List<JsonTokenBalance> tokenBalances = JsonSerializer.Deserialize<List<JsonTokenBalance>>(miscInfo.UserModels.Models)!;
        int tokenBalanceIndex = tokenBalances.FindIndex(x => x.ModelId == request.ModelId);
        JsonTokenBalance? tokenBalance = tokenBalances[tokenBalanceIndex];
        if (tokenBalance == null)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (!tokenBalance.Enabled)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (tokenBalance.Expires != "-" && DateTime.Parse(tokenBalance.Expires) < DateTime.UtcNow)
        {
            return this.BadRequestMessage("Subscription has expired");
        }
        if (tokenBalance.Counts == "0" && tokenBalance.Tokens == "0" && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
        {
            return this.BadRequestMessage("Insufficient balance");
        }

        Dictionary<long, MessageLiteDto> existingMessages = await db.Messages
            .Where(x => x.ConversationId == request.ConversationId && x.UserId == currentUser.Id)
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = x.MessageContents.ToArray(),
                Role = (DBConversationRoles)x.ChatRoleId,
                ParentId = x.ParentId,
            })
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
                return this.BadRequestMessage("Prompt is required for the first message");
            }

            Message toBeInsert = new()
            {
                ConversationId = request.ConversationId,
                UserId = currentUser.Id,
                ChatRoleId = (byte)DBConversationRoles.System,
                MessageContents =
                [
                    new MessageContent()
                    {
                        ContentTypeId = (byte)DBMessageContentType.Text,
                        Content = Encoding.Unicode.GetBytes(request.UserModelConfig.Prompt),
                    }
                ], 
                CreatedAt = DateTime.UtcNow,
            };
            db.Messages.Add(toBeInsert);

            systemMessage = new MessageLiteDto
            {
                Id = toBeInsert.Id,
                Content = MessageContentDto.FromText(request.UserModelConfig.Prompt),
                Role = DBConversationRoles.System,
                ParentId = null,
            };

            miscInfo.ThisChat.Title = request.UserMessage.Text[..Math.Min(30, request.UserMessage.Text.Length)];
            miscInfo.ThisChat.ChatModelId = request.ModelId;
        }
        else
        {
            request = request with { UserModelConfig = JsonSerializer.Deserialize<JsonUserModelConfig>(miscInfo.ThisChat.UserModelConfig)! };
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

                if (cancellationToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
            responseText.Append(e.Message);
            await YieldResponse(new SseResponseLine { Result = e.Message, Success = true });
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
            string errorTextToResponse = "\n⚠Error in conversation - 对话出错!";
            responseText.Append(errorTextToResponse);
            await YieldResponse(new SseResponseLine { Result = errorTextToResponse, Success = true });
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
        }

        int elapsedMs = (int)sw.ElapsedMilliseconds;

        // success
        // insert new assistant message
        TransactionLog? transactionLog = CreateTransactionLog(miscInfo.UserModels, tokenBalances, tokenBalanceIndex, tokenBalance, cost);
        Message assistantMessage = new()
        {
            ConversationId = request.ConversationId,
            UserId = currentUser.Id,
            ChatRoleId = (byte)DBConversationRoles.Assistant,
            MessageContents =
            [
                new MessageContent()
                {
                    ContentTypeId = (byte)DBMessageContentType.Text,
                    Content = Encoding.Unicode.GetBytes(responseText.ToString()),
                }
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessage.Id,
            MessageResponse = new MessageResponse()
            {
                DurationMs = elapsedMs,
                InputTokenCount = lastSegment.InputTokenCount,
                OutputTokenCount = lastSegment.OutputTokenCount,
                InputCost = cost.InputTokenPrice,
                OutputCost = cost.OutputTokenPrice,
                ChatModelId = cm.Id,
                TransactionLog = transactionLog,
            }
        };
        db.Messages.Add(assistantMessage);

        await db.SaveChangesAsync(cancellationToken);
        if (cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(currentUser.Id);
        }

        return new EmptyResult();
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
        Message dbUserMessage = new()
        {
            ConversationId = request.ConversationId,
            UserId = currentUser.Id,
            ChatRoleId = (byte)DBConversationRoles.User,
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

    private TransactionLog? CreateTransactionLog(UserModel userModel, List<JsonTokenBalance> userModelConfigs, int userModelConfigIndex, JsonTokenBalance userModelConfig, UserModelBalanceCost cost)
    {
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            userModelConfigs[userModelConfigIndex] = userModelConfig;
            userModel.Models = JsonSerializer.Serialize(userModelConfigs);
        }
        if (cost.CostBalance > 0)
        {
            TransactionLog transactionLog = new()
            {
                UserId = currentUser.Id,
                CreatedAt = DateTime.UtcNow,
                CreditUserId = currentUser.Id,
                Amount = -cost.CostBalance,
                TransactionTypeId = (byte)DBTransactionType.Cost,
            };
            db.TransactionLogs.Add(transactionLog);
            return transactionLog;
        }
        return null;
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data:"u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lfu8 = "\n"u8.ToArray();

    private async Task YieldResponse(SseResponseLine line)
    {
        await Response.Body.WriteAsync(dataU8);
        await Response.Body.WriteAsync(JsonSerializer.SerializeToUtf8Bytes(line, JSON.JsonSerializerOptions));
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