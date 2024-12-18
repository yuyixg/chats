using Chats.BE.Controllers.Chats.Chats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.ChatServices;
using Chats.BE.Services.ChatServices.Dtos;
using Chats.BE.Services.ChatServices.Implementations.Test;
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

namespace Chats.BE.Controllers.Chats.Chats;

[Route("api/chats"), Authorize]
public class ChatController(
    ChatsDB db, 
    CurrentUser currentUser, 
    ILogger<ChatController> logger, 
    IUrlEncryptionService idEncryption,
    ChatStopService stopService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ChatRequest request,
        [FromServices] BalanceService balanceService,
        [FromServices] ChatFactory conversationFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
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
            thisChat.EnableSearch = request.UserModelConfig.EnableSearch;
            thisChat.Temperature = request.UserModelConfig.Temperature;
        }
        else
        {
            request = request with
            {
                UserModelConfig = new JsonUserModelConfig
                {
                    EnableSearch = request.UserModelConfig.EnableSearch ?? thisChat.EnableSearch,
                    Temperature = request.UserModelConfig.Temperature ?? thisChat.Temperature,
                }
            };
        }

        List<OpenAIChatMessage> messageToSend =
        [
            ..(systemMessage != null ? [new SystemChatMessage(systemMessage.Content[0].ToString())] : Array.Empty<OpenAIChatMessage>()),
            ..await GetMessageTree(existingMessages, messageId).ToAsyncEnumerable().SelectAwait(async x => await x.ToOpenAI(fup, cancellationToken)).ToArrayAsync(cancellationToken),
        ];

        // new user message
        MessageLiteDto userMessageLite;
        Message? dbUserMessage = null;
        if (messageId != null && existingMessages.TryGetValue(messageId.Value, out MessageLiteDto? parentMessage) && parentMessage.Role == DBChatRole.User)
        {
            // existing user message
            userMessageLite = existingMessages[messageId!.Value];
        }
        else
        {
            // insert new user message
            dbUserMessage = new()
            {
                ChatId = chatId,
                ChatRoleId = (byte)DBChatRole.User,
                MessageContents = request.UserMessage.ToMessageContents(idEncryption),
                CreatedAt = DateTime.UtcNow,
                ParentId = messageId,
            };
            db.Messages.Add(dbUserMessage);
            await db.SaveChangesAsync(cancellationToken);
            userMessageLite = new()
            {
                Id = dbUserMessage.Id,
                Content = request.UserMessage.ToMessageContents(idEncryption),
                Role = (DBChatRole)dbUserMessage.ChatRoleId,
                ParentId = dbUserMessage.ParentId,
            };
            messageToSend.Add(await userMessageLite.ToOpenAI(fup, cancellationToken));
        }

        string? errorText = null;
        bool everYield = false;
        string? stopId = null;
        try
        {
            if (userModel == null)
            {
                icc.FinishReason = DBFinishReason.InvalidModel;
                throw new InvalidModelException(request.ModelId.ToString());
            }

            ChatCompletionOptions cco = request.UserModelConfig.ToChatCompletionOptions(currentUser.Id);
            using ChatService s = conversationFactory.CreateConversationService(userModel.Model);
            await foreach (InternalChatSegment seg in icc.Run(userBalance.Balance, userModel, s.ChatStreamedFEProcessed(messageToSend, cco, cancellationToken)))
            {
                if (seg.TextSegment == string.Empty) continue;
                if (!everYield)
                {
                    Response.Headers.ContentType = "text/event-stream";
                    Response.Headers.CacheControl = "no-cache";
                    Response.Headers.Connection = "keep-alive";
                    stopId = stopService.CreateAndCombineCancellationToken(ref cancellationToken);
                    await YieldResponse(SseResponseLine.StopId(stopId));
                    everYield = true;
                }
                await YieldResponse(SseResponseLine.Segment(seg.TextSegment));

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
            logger.LogError(e, "Upstream error: {userMessageId}", userMessageLite.Id);
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
            logger.LogError(e, "Error in conversation for message: {userMessageId}", userMessageLite.Id);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
            if (stopId != null)
            {
                stopService.Remove(stopId);
            }
        }

        // success
        // insert new assistant message
        InternalChatSegment fullResponse = icc.FullResponse;
        Message dbAssistantMessage = new()
        {
            ChatId = chatId,
            ChatRoleId = (byte)DBChatRole.Assistant,
            MessageContents =
            [
                MessageContent.FromText(fullResponse.TextSegment),
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = userMessageLite.Id,
        };

        if (errorText != null)
        {
            dbAssistantMessage.MessageContents.Add(MessageContent.FromError(errorText));
            await YieldResponse(SseResponseLine.Error(errorText));
        }
        dbAssistantMessage.Usage = icc.ToUserModelUsage(currentUser.Id, await clientInfoManager.GetClientInfo(cancellationToken), isApi: false);
        db.Messages.Add(dbAssistantMessage);

        await db.SaveChangesAsync(cancellationToken);
        if (icc.Cost.CostBalance > 0)
        {
            await balanceService.UpdateBalance(db, currentUser.Id, CancellationToken.None);
        }
        if (icc.Cost.CostUsage)
        {
            await balanceService.UpdateUsage(db, userModel!.Id, CancellationToken.None);
        }

        await YieldResponse(SseResponseLine.PostMessage(dbUserMessage, dbAssistantMessage, idEncryption, fup));
        if (existingMessages.Count == 0)
        {
            await YieldTitle(thisChat.Title);
        }
        return new EmptyResult();
    }

    private async Task YieldTitle(string title)
    {
        await YieldResponse(SseResponseLine.UpdateTitle(""));
        foreach (string segment in TestChatService.UnicodeCharacterSplit(title))
        {
            await YieldResponse(SseResponseLine.TitleSegment(segment));
        }
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data: "u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lfu8 = "\r\n\r\n"u8.ToArray();

    private async Task YieldResponse<T>(SseResponseLine<T> line)
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

    [HttpPost("stop/{stopId}")]
    public IActionResult StopChat(string stopId)
    {
        if (stopService.TryCancel(stopId))
        {
            return Ok();
        }
        else
        {
            return NotFound();
        }
    }
}
