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
using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using DBChatMessage = Chats.BE.DB.ChatMessage;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats2"), Authorize]
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
            return BadRequest("Model not found");
        }

        JsonPriceConfig priceConfig = JsonSerializer.Deserialize<JsonPriceConfig>(cm.PriceConfig)!;

        var userInfo = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => new
            {
                UserModels = x.UserModel!,
                UserBalance = x.UserBalance!
            })
            .SingleAsync(cancellationToken);
        List<JsonUserModel> userModelConfigs = JsonSerializer.Deserialize<List<JsonUserModel>>(userInfo.UserModels.Models)!;
        int userModelConfigIndex = userModelConfigs.FindIndex(x => x.ModelId == request.ModelId);
        JsonUserModel? userModelConfig = userModelConfigs[userModelConfigIndex];
        if (userModelConfig == null)
        {
            return BadRequest("User model not found");
        }
        if (!userModelConfig.Enabled)
        {
            return BadRequest("User model is disabled");
        }
        if (userModelConfig.Expires != "-" && DateTime.Parse(userModelConfig.Expires) < DateTime.UtcNow)
        {
            return BadRequest("User model is expired");
        }
        if (userModelConfig.Counts == "0" && userModelConfig.Tokens == "0" && userInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
        {
            return BadRequest("User model is out of balance");
        }

        MessageLiteDto[] existingMessages = await db.ChatMessages
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
            .ToArrayAsync(cancellationToken);
        MessageLiteDto? systemMessage = existingMessages
            .Where(x => x.Role == DBConversationRoles.System)
            .FirstOrDefault();
        // insert system message if it doesn't exist
        if (systemMessage == null)
        {
            if (request.UserModelConfig.Prompt == null)
            {
                return BadRequest("Prompt is required for the first message");
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
        }

        // insert new user message
        DBChatMessage userMessage = new()
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            UserId = currentUser.Id,
            Role = DBConversationRoles.User,
            Messages = request.UserMessage.ToJson(),
            CreatedAt = DateTime.UtcNow,
            ParentId = request.MessageId,
        };
        db.ChatMessages.Add(userMessage);

        OpenAIChatMessage[] messageLine =
        [
            new SystemChatMessage(systemMessage.Content.Text),
            ..GetMessageTree(existingMessages, userMessage.ParentId),
        ];

        ConversationService s = await conversationFactory.CreateConversationService(cm, cancellationToken);
        ConversationSegment lastSegment = new() { TextSegment = "", InputTokenCount = 0, OutputTokenCount = 0 };
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        StringBuilder responseText = new();
        UserModelBalanceCost cost = null!;
        Stopwatch sw = Stopwatch.StartNew();
        try
        {
            UserModelBalanceCalculator calculator = new(userModelConfig, userInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);

            await foreach (ConversationSegment seg in s.ChatStreamed(messageLine, request.UserModelConfig, cancellationToken))
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

            return new EmptyResult();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error in conversation");
            string errorTextToResponse = "\n⚠Error in conversation - 对话出错!";
            responseText.Append(errorTextToResponse);
            await YieldResponse(new SseResponseLine { Result = errorTextToResponse, Success = false });
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
        };
        db.ChatMessages.Add(assistantMessage);

        UpdateBalance(userInfo.UserModels, userInfo.UserBalance, userModelConfigs, userModelConfigIndex, userModelConfig, cost, assistantMessage.Id);
        await db.SaveChangesAsync(cancellationToken);

        return new EmptyResult();
    }

    private void UpdateBalance(UserModel userModel, UserBalance userBalance, List<JsonUserModel> userModelConfigs, int userModelConfigIndex, JsonUserModel userModelConfig, UserModelBalanceCost cost, Guid assistantMessageId)
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

    static ReadOnlyMemory<byte> dataU8 = "data:"u8.ToArray();
    static ReadOnlyMemory<byte> lfu8 = "\n"u8.ToArray();
    static JsonSerializerOptions JsonSerializerOptions = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    private async Task YieldResponse(SseResponseLine line)
    {
        await Response.Body.WriteAsync(dataU8);
        await Response.Body.WriteAsync(JsonSerializer.SerializeToUtf8Bytes(line, JsonSerializerOptions));
        await Response.Body.WriteAsync(lfu8);
        await Response.Body.FlushAsync();
    }

    static IEnumerable<OpenAIChatMessage> GetMessageTree(MessageLiteDto[] existingMessages, Guid? fromParentId)
    {
        Dictionary<Guid, MessageLiteDto> existingMessageMaps = existingMessages.ToDictionary(k => k.Id, v => v);
        LinkedList<MessageLiteDto> line = [];
        Guid? currentParentId = fromParentId;
        while (currentParentId != null)
        {
            if (!existingMessageMaps.ContainsKey(currentParentId.Value))
            {
                break;
            }
            line.AddFirst(existingMessageMaps[currentParentId.Value]);
            currentParentId = existingMessageMaps[currentParentId.Value].ParentId;
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