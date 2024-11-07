using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Common;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.IdEncryption;
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
public class ConversationController(ChatsDB db, CurrentUser currentUser, ILogger<ConversationController> logger, IIdEncryptionService idEncryption) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ConversationRequest request,
        [FromServices] BalanceService balanceService,
        [FromServices] ConversationFactory conversationFactory,
        CancellationToken cancellationToken)
    {
        int conversationId = idEncryption.DecryptAsInt32(request.ConversationId);
        long? messageId = request.MessageId != null ? idEncryption.DecryptAsInt64(request.MessageId) : null;
        Model? cm = await db.Models
            .Where(x => x.Id == request.ModelId && !x.IsDeleted)
            .Include(x => x.ModelKey)
            .Include(x => x.ModelKey.ModelProvider)
            .Include(x => x.ModelReference)
            .FirstOrDefaultAsync(x => x.Id == request.ModelId, cancellationToken: cancellationToken);
        if (cm == null)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }

        JsonPriceConfig priceConfig = cm.ToPriceConfig();

        var miscInfo = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => new
            {
                UserModel = x.UserModel2s.FirstOrDefault(x => x.ModelId == request.ModelId),
                UserBalance = x.UserBalance!,
                ThisChat = db.Conversation2s.Single(x => x.Id == conversationId && x.UserId == currentUser.Id)
            })
            .SingleAsync(cancellationToken);
        if (miscInfo.UserModel == null)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (miscInfo.UserModel.IsDeleted)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }
        if (miscInfo.UserModel.ExpiresAt.IsExpired())
        {
            return this.BadRequestMessage("Subscription has expired");
        }
        if (miscInfo.UserModel.TokenBalance == 0 && miscInfo.UserModel.CountBalance == 0 && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
        {
            return this.BadRequestMessage("Insufficient balance");
        }

        Dictionary<long, MessageLiteDto> existingMessages = await db.Message2s
            .Where(x => x.ConversationId == conversationId && x.Conversation.UserId == currentUser.Id)
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = x.MessageContent2s
                    .OrderBy(x => x.Id)
                    .Select(x => x.ToSegment())
                    .ToArray(),
                Role = (DBConversationRole)x.ChatRoleId,
                ParentId = x.ParentId,
            })
            .ToDictionaryAsync(x => x.Id, x => x, cancellationToken);
        MessageLiteDto? systemMessage = existingMessages
            .Values
            .Where(x => x.Role == DBConversationRole.System)
            .FirstOrDefault();
        // insert system message if it doesn't exist
        if (systemMessage == null)
        {
            if (request.UserModelConfig.Prompt == null)
            {
                return this.BadRequestMessage("Prompt is required for the first message");
            }

            Message2 toBeInsert = new()
            {
                ConversationId = conversationId,
                ChatRoleId = (byte)DBConversationRole.System,
                MessageContent2s =
                [
                    MessageContent2.FromText(request.UserModelConfig.Prompt)
                ],
                CreatedAt = DateTime.UtcNow,
            };
            db.Message2s.Add(toBeInsert);

            systemMessage = new MessageLiteDto
            {
                Id = toBeInsert.Id,
                Content = [toBeInsert.MessageContent2s.First().ToSegment()],
                Role = DBConversationRole.System,
                ParentId = null,
            };

            miscInfo.ThisChat.Title = request.UserMessage.Text[..Math.Min(50, request.UserMessage.Text.Length)];
            miscInfo.ThisChat.ModelId = request.ModelId;
        }
        else
        {
            request = request with
            {
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = miscInfo.ThisChat.EnableSearch,
                    Temperature = miscInfo.ThisChat.Temperature,
                }
            };
        }

        List<OpenAIChatMessage> messageToSend =
        [
            systemMessage.Content[0].ToOpenAISystemChatMessage(),
            ..GetMessageTree(existingMessages, messageId),
        ];

        // new user message
        MessageLiteDto userMessage;
        if (messageId != null && existingMessages.TryGetValue(messageId.Value, out MessageLiteDto? parentMessage) && parentMessage.Role == DBConversationRole.User)
        {
            // existing user message
            userMessage = existingMessages[messageId!.Value];
        }
        else
        {
            // insert new user message
            Message2 dbUserMessage = new()
            {
                ConversationId = conversationId,
                ChatRoleId = (byte)DBConversationRole.User,
                MessageContent2s = request.UserMessage.ToMessageContents(),
                CreatedAt = DateTime.UtcNow,
                ParentId = messageId,
            };
            db.Message2s.Add(dbUserMessage);
            await db.SaveChangesAsync(cancellationToken);
            userMessage = new()
            {
                Id = dbUserMessage.Id,
                Content = request.UserMessage.ToMessageSegments(),
                Role = (DBConversationRole)dbUserMessage.ChatRoleId,
                ParentId = dbUserMessage.ParentId,
            };
            messageToSend.Add(userMessage.ToOpenAI());
        }

        ConversationSegment lastSegment = new() { TextSegment = "", InputTokenCount = 0, OutputTokenCount = 0 };
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        StringBuilder responseText = new();
        string? errorText = null;
        UserModelBalanceCost cost = null!;
        Stopwatch sw = Stopwatch.StartNew();
        try
        {
            UserModelBalanceCalculator calculator = new(miscInfo.UserModel, miscInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);
            if (!cost.IsSufficient)
            {
                throw new InsufficientBalanceException();
            }

            using ConversationService s = conversationFactory.CreateConversationService(cm);
            ChatCompletionOptions cco = new()
            {
                MaxOutputTokenCount = cm.ModelReference.MaxResponseTokens,
                Temperature = request.UserModelConfig.Temperature != null 
                    ? Math.Clamp(request.UserModelConfig.Temperature.Value, (float)cm.ModelReference.MinTemperature, (float)cm.ModelReference.MaxTemperature) 
                    : null,
                EndUserId = currentUser.Id.ToString(),
            };
            await foreach (ConversationSegment seg in s.ChatStreamed(messageToSend, cco, cancellationToken))
            {
                lastSegment = seg;
                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.InputTokenCount, seg.OutputTokenCount, priceConfig);
                if (!currentCost.IsSufficient)
                {
                    throw new InsufficientBalanceException();
                }
                cost = currentCost;

                if (seg.TextSegment == string.Empty) continue;
                await YieldResponse(new() { Result = seg.TextSegment, Success = true });
                responseText.Append(seg.TextSegment);

                if (cancellationToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }
        catch (InsufficientBalanceException)
        {
            errorText = "Insufficient balance";
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            errorText = e.Message;
            logger.LogError(e, "Upstream error: {userMessageId}", userMessage.Id);
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
            errorText = "Conversation cancelled";
        }
        catch (Exception e)
        {
            errorText = "Unknown Error";
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
        }

        int elapsedMs = (int)sw.ElapsedMilliseconds;

        // success
        // insert new assistant message
        UserModelTransactionLog? userModelTransactionLog = null;
        TransactionLog? transactionLog = null;
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            userModelTransactionLog = new UserModelTransactionLog()
            {
                CountAmount = -cost.CostCount,
                TokenAmount = -cost.CostTokens,
                CreatedAt = DateTime.UtcNow,
                TransactionTypeId = (byte)DBTransactionType.Cost,
                UserModelId = miscInfo.UserModel.Id,
            };
            db.UserModelTransactionLogs.Add(userModelTransactionLog);
        }
        if (cost.CostBalance > 0)
        {
            transactionLog = new()
            {
                UserId = currentUser.Id,
                CreatedAt = DateTime.UtcNow,
                CreditUserId = currentUser.Id,
                Amount = -cost.CostBalance,
                TransactionTypeId = (byte)DBTransactionType.Cost,
            };
            db.TransactionLogs.Add(transactionLog);
        }
        Message2 assistantMessage = new()
        {
            ConversationId = conversationId,
            ChatRoleId = (byte)DBConversationRole.Assistant,
            MessageContent2s =
            [
                MessageContent2.FromText(responseText.ToString()),
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessage.Id,
            MessageResponse2 = new MessageResponse2()
            {
                DurationMs = elapsedMs,
                InputTokenCount = lastSegment.InputTokenCount,
                OutputTokenCount = lastSegment.OutputTokenCount,
                InputCost = cost.InputTokenPrice,
                OutputCost = cost.OutputTokenPrice,
                ModelId = cm.Id,
                TransactionLog = transactionLog,
                UserModelTransactionLog = userModelTransactionLog,
            }
        };
        if (errorText != null)
        {
            assistantMessage.MessageContent2s.Add(MessageContent2.FromError(errorText));
            await YieldResponse(new() { Result = errorText, Success = false });
        }
        db.Message2s.Add(assistantMessage);

        await db.SaveChangesAsync(cancellationToken);
        if (cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(currentUser.Id, CancellationToken.None);
        }

        return new EmptyResult();
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

    static IEnumerable<OpenAIChatMessage> GetMessageTree(Dictionary<long, MessageLiteDto> existingMessages, long? fromParentId)
    {
        LinkedList<MessageLiteDto> line = [];
        long? currentParentId = fromParentId;
        while (currentParentId != null)
        {
            if (!existingMessages.ContainsKey(currentParentId.Value))
            {
                break;
            }
            line.AddFirst(existingMessages[currentParentId.Value]);
            currentParentId = existingMessages[currentParentId.Value].ParentId;
        }
        return line.Select(x => x.ToOpenAI());
    }
}
