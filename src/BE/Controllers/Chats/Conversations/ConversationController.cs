using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using Sdcb.DashScope;
using System.ClientModel;
using System.Text.Json;
using TencentCloud.Common;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats"), Authorize]
public class ConversationController(ChatsDB db, CurrentUser currentUser, ILogger<ConversationController> logger, IUrlEncryptionService idEncryption) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ConversationRequest request,
        [FromServices] BalanceService balanceService,
        [FromServices] ConversationFactory conversationFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fileDownloadUrlProvider,
        CancellationToken cancellationToken)
    {
        InChatContext icc = new();
        int chatId = idEncryption.DecryptChatId(request.EncryptedChatId);
        long? messageId = request.EncryptedMessageId != null ? idEncryption.DecryptMessageId(request.EncryptedMessageId) : null;

        UserModel? userModel = await userModelManager.GetUserModel(currentUser.Id, request.ModelId, cancellationToken);

        UserBalance userBalance = await db.UserBalances.Where(x => x.UserId == currentUser.Id).SingleAsync(cancellationToken);
        Chat? thisChat = await db.Chats.SingleOrDefaultAsync(x => x.Id == chatId && x.UserId == currentUser.Id, cancellationToken);
        if (thisChat == null)
        {
            return this.BadRequestMessage("Chat not found");
        }

        Dictionary<long, MessageLiteDto> existingMessages = await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileImageInfo)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(x => x.ChatId == chatId && x.Chat.UserId == currentUser.Id)
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .ToArray(),
                Role = (DBChatRole)x.ChatRoleId,
                ParentId = x.ParentId,
            })
            .ToDictionaryAsync(x => x.Id, x => x, cancellationToken);
        MessageLiteDto? systemMessage = existingMessages
            .Values
            .Where(x => x.Role == DBChatRole.System)
            .FirstOrDefault();
        // insert system message if it doesn't exist
        if (existingMessages.Count == 0)
        {
            if (!string.IsNullOrWhiteSpace(request.UserModelConfig.Prompt))
            {
                Message toBeInsert = new()
                {
                    ChatId = chatId,
                    ChatRoleId = (byte)DBChatRole.System,
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
                    Content = [toBeInsert.MessageContents.First()],
                    Role = DBChatRole.System,
                    ParentId = null,
                };
            }

            thisChat.Title = request.UserMessage.Text[..Math.Min(50, request.UserMessage.Text.Length)];
            thisChat.ModelId = request.ModelId;
        }
        else
        {
            request = request with
            {
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = thisChat.EnableSearch,
                    Temperature = thisChat.Temperature,
                }
            };
        }

        List<OpenAIChatMessage> messageToSend =
        [
            ..(systemMessage != null ? [new SystemChatMessage(systemMessage.Content[0].ToString())] : Array.Empty<OpenAIChatMessage>()),
            ..await GetMessageTree(existingMessages, messageId).ToAsyncEnumerable().SelectAwait(async x => await x.ToOpenAI(fileDownloadUrlProvider, cancellationToken)).ToArrayAsync(cancellationToken),
        ];

        // new user message
        MessageLiteDto userMessage;
        if (messageId != null && existingMessages.TryGetValue(messageId.Value, out MessageLiteDto? parentMessage) && parentMessage.Role == DBChatRole.User)
        {
            // existing user message
            userMessage = existingMessages[messageId!.Value];
        }
        else
        {
            // insert new user message
            Message dbUserMessage = new()
            {
                ChatId = chatId,
                ChatRoleId = (byte)DBChatRole.User,
                MessageContents = request.UserMessage.ToMessageContents(idEncryption),
                CreatedAt = DateTime.UtcNow,
                ParentId = messageId,
            };
            db.Messages.Add(dbUserMessage);
            await db.SaveChangesAsync(cancellationToken);
            userMessage = new()
            {
                Id = dbUserMessage.Id,
                Content = request.UserMessage.ToMessageContents(idEncryption),
                Role = (DBChatRole)dbUserMessage.ChatRoleId,
                ParentId = dbUserMessage.ParentId,
            };
            messageToSend.Add(await userMessage.ToOpenAI(fileDownloadUrlProvider, cancellationToken));
        }

        string? errorText = null;
        bool everYield = false;
        try
        {
            if (userModel == null)
            {
                icc.FinishReason = DBFinishReason.InvalidModel;
                throw new InvalidModelException(request.ModelId.ToString());
            }

            using ConversationService s = conversationFactory.CreateConversationService(userModel.Model);
            ChatCompletionOptions cco = new()
            {
                Temperature = request.UserModelConfig.Temperature != null 
                    ? Math.Clamp(request.UserModelConfig.Temperature.Value, (float)userModel.Model.ModelReference.MinTemperature, (float)userModel.Model.ModelReference.MaxTemperature) 
                    : null,
                EndUserId = currentUser.Id.ToString(),
            };
            await foreach (InternalChatSegment seg in icc.Run(userBalance.Balance, userModel, s.ChatStreamedFEProcessed(messageToSend, cco, cancellationToken)))
            {
                if (seg.TextSegment == string.Empty) continue;
                if (!everYield)
                {
                    Response.Headers.ContentType = "text/event-stream";
                    Response.Headers.CacheControl = "no-cache";
                    Response.Headers.Connection = "keep-alive";
                    everYield = true;
                }
                await YieldResponse(new() { Result = seg.TextSegment, Success = true });

                if (cancellationToken.IsCancellationRequested)
                {
                    throw new TaskCanceledException();
                }
            }
        }
        catch (ChatServiceException cse)
        {
            icc.FinishReason = cse.ErrorCode;
            return this.BadRequestMessage(cse.Message);
        }
        catch (Exception e) when (e is DashScopeException or ClientResultException or TencentCloudSDKException)
        {
            icc.FinishReason = DBFinishReason.UpstreamError;
            errorText = e.Message;
            logger.LogError(e, "Upstream error: {userMessageId}", userMessage.Id);
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
            icc.FinishReason = DBFinishReason.Cancelled;
            errorText = "Conversation cancelled";
        }
        catch (Exception e)
        {
            icc.FinishReason = DBFinishReason.UnknownError;
            errorText = "Unknown Error";
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessage.Id);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
        }

        // success
        // insert new assistant message
        InternalChatSegment fullResponse = icc.FullResponse;
        Message assistantMessage = new()
        {
            ChatId = chatId,
            ChatRoleId = (byte)DBChatRole.Assistant,
            MessageContents =
            [
                MessageContent.FromText(fullResponse.TextSegment),
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessage.Id,
        };

        if (errorText != null)
        {
            assistantMessage.MessageContents.Add(MessageContent.FromError(errorText));
            await YieldResponse(new() { Result = errorText, Success = false });
        }
        assistantMessage.Usage = icc.ToUserModelUsage(currentUser.Id, await clientInfoManager.GetClientInfo(cancellationToken), isApi: false);
        db.Messages.Add(assistantMessage);

        await db.SaveChangesAsync(cancellationToken);
        if (icc.Cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(currentUser.Id, CancellationToken.None);
        }
        if (icc.Cost.CostUsage)
        {
            _ = balanceService.AsyncUpdateUsage([userModel!.Id], CancellationToken.None);
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

    static LinkedList<MessageLiteDto> GetMessageTree(Dictionary<long, MessageLiteDto> existingMessages, long? fromParentId)
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
        return line;
    }
}
