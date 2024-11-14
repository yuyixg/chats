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
using Chats.BE.Services.Conversations.Extensions;
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
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        CancellationToken cancellationToken)
    {
        int conversationId = idEncryption.DecryptAsInt32(request.ConversationId);
        long? messageId = request.MessageId != null ? idEncryption.DecryptAsInt64(request.MessageId) : null;
        DateTime messageReceiveTime = DateTime.UtcNow;

        UserModel? userModel = await userModelManager.GetUserModel(currentUser.Id, request.ModelId, cancellationToken);
        if (userModel == null)
        {
            return this.BadRequestMessage("The Model does not exist or access is denied.");
        }

        JsonPriceConfig priceConfig = userModel.Model.ToPriceConfig();

        var miscInfo = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .Select(x => new
            {
                UserBalance = x.UserBalance!,
                ThisChat = db.Chats.Single(x => x.Id == conversationId && x.UserId == currentUser.Id)
            })
            .SingleAsync(cancellationToken);

        if (userModel.ExpiresAt.IsExpired())
        {
            return this.BadRequestMessage("Subscription has expired");
        }
        if (userModel.TokenBalance == 0 && userModel.CountBalance == 0 && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
        {
            return this.BadRequestMessage("Insufficient balance");
        }

        Dictionary<long, MessageLiteDto> existingMessages = await db.Messages
            .Where(x => x.ConversationId == conversationId && x.Conversation.UserId == currentUser.Id)
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = x.MessageContents
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

            Message toBeInsert = new()
            {
                ConversationId = conversationId,
                ChatRoleId = (byte)DBConversationRole.System,
                MessageContents =
                [
                    MessageContent.FromText(request.UserModelConfig.Prompt)
                ],
                CreatedAt = DateTime.UtcNow,
            };
            db.Messages.Add(toBeInsert);

            systemMessage = new MessageLiteDto
            {
                Id = toBeInsert.Id,
                Content = [toBeInsert.MessageContents.First().ToSegment()],
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
            Message dbUserMessage = new()
            {
                ConversationId = conversationId,
                ChatRoleId = (byte)DBConversationRole.User,
                MessageContents = request.UserMessage.ToMessageContents(),
                CreatedAt = DateTime.UtcNow,
                ParentId = messageId,
            };
            db.Messages.Add(dbUserMessage);
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
            UserModelBalanceCalculator calculator = new(userModel, miscInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);
            if (!cost.IsSufficient)
            {
                throw new InsufficientBalanceException();
            }

            using ConversationService s = conversationFactory.CreateConversationService(userModel.Model);
            ChatCompletionOptions cco = new()
            {
                MaxOutputTokenCount = userModel.Model.ModelReference.MaxResponseTokens,
                Temperature = request.UserModelConfig.Temperature != null 
                    ? Math.Clamp(request.UserModelConfig.Temperature.Value, (float)userModel.Model.ModelReference.MinTemperature, (float)userModel.Model.ModelReference.MaxTemperature) 
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
        Message assistantMessage = new()
        {
            ConversationId = conversationId,
            ChatRoleId = (byte)DBConversationRole.Assistant,
            MessageContents =
            [
                MessageContent.FromText(responseText.ToString()),
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessage.Id,
            Usage = new UserModelUsage()
            {
                DurationMs = elapsedMs,
                InputTokenCount = lastSegment.InputTokenCount,
                OutputTokenCount = lastSegment.OutputTokenCount,
                InputCost = cost.InputTokenPrice,
                OutputCost = cost.OutputTokenPrice,
                UserModelId = userModel.Id,
                CreatedAt = DateTime.UtcNow,
                ClientInfo = await clientInfoManager.GetClientInfo(CancellationToken.None),
            }
        };
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            assistantMessage.Usage.UsageTransaction = new UsageTransaction()
            {
                CountAmount = -cost.CostCount,
                TokenAmount = -cost.CostTokens,
                CreatedAt = assistantMessage.Usage.CreatedAt,
                TransactionTypeId = (byte)DBTransactionType.Cost,
                UserModelId = userModel.Id,
            };
        }
        if (cost.CostBalance > 0)
        {
            assistantMessage.Usage.BalanceTransaction = new BalanceTransaction()
            {
                UserId = currentUser.Id,
                CreatedAt = assistantMessage.Usage.CreatedAt,
                CreditUserId = currentUser.Id,
                Amount = -cost.CostBalance,
                TransactionTypeId = (byte)DBTransactionType.Cost,
            };
        }

        if (errorText != null)
        {
            assistantMessage.MessageContents.Add(MessageContent.FromError(errorText));
            await YieldResponse(new() { Result = errorText, Success = false });
        }
        db.Messages.Add(assistantMessage);

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
