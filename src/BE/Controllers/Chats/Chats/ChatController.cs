using Azure.Core;
using Chats.BE.Controllers.Chats.Chats.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
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
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Threading.Channels;
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
        DecryptedChatRequest req = request.Decrypt(idEncryption);

        // one of message id and user message must be non-null
        if (req.MessageId == null && req.UserMessage == null)
        {
            return BadRequest("Message id or user message must be provided");
        }

        Chat? chat = await db.Chats
            .Include(x => x.ChatSpans)
            .FirstOrDefaultAsync(x => x.Id == req.ChatId && x.UserId == currentUser.Id, cancellationToken);
        if (chat == null || chat.UserId != currentUser.Id)
        {
            return NotFound();
        }

        // ensure request span id is unique
        if (req.Spans.Select(x => x.SpanId).Distinct().Count() != req.Spans.Length)
        {
            return BadRequest("Duplicate span id");
        }

        // ensure chat.ChatSpan contains all span ids that in request, otherwise return error
        if (req.Spans.Any(x => !chat.ChatSpans.Any(y => y.SpanId == x.SpanId)))
        {
            return BadRequest("Invalid span id");
        }

        // get span id -> model id mapping but request only contains span id, so we need to get model id from chat.ChatSpan
        Dictionary<byte, short> spanModelMapping = req.Spans.ToDictionary(x => x.SpanId, x => chat.ChatSpans.First(y => y.SpanId == x.SpanId).ModelId);
        Dictionary<short, UserModel> userModels = await userModelManager.GetUserModels(currentUser.Id, [.. spanModelMapping.Values], cancellationToken);

        // ensure all model ids are valid
        if (userModels.Count != spanModelMapping.Count)
        {
            return BadRequest("Invalid span model");
        }

        Dictionary<long, MessageLiteDto> existingMessages = await db.Messages
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentFile).ThenInclude(x => x!.File).ThenInclude(x => x.FileImageInfo)
            .Include(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .Where(x => x.ChatId == req.ChatId && x.Chat.UserId == currentUser.Id)
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = x.MessageContents
                    .OrderBy(x => x.Id)
                    .ToArray(),
                Role = (DBChatRole)x.ChatRoleId,
                ParentId = x.ParentId,
                SpanId = x.SpanId,
            })
            .ToDictionaryAsync(x => x.Id, x => x, cancellationToken);

        // insert system message if it doesn't exist
        List<MessageLiteDto> additionalMessages = new(capacity: req.Spans.Length + 1);
        if (existingMessages.Count == 0)
        {
            if (req.AllSystemPromptSame && req.Spans[0].SystemPromptValid)
            {
                // only insert null spaned system message if all prompts are the same
                additionalMessages.Add(MakeSystemMessage(null, db, req));
            }
            else
            {
                foreach (ChatSpanRequest span in req.Spans)
                {
                    if (!string.IsNullOrWhiteSpace(span.SystemPrompt))
                    {
                        additionalMessages.Add(MakeSystemMessage(span.SpanId, db, req));
                    }
                }
            }
        }
        // make user message
        Message? dbUserMessage = null;
        if (req.MessageId != null)
        {
            if (!existingMessages.TryGetValue(req.MessageId.Value, out MessageLiteDto? parentMessage))
            {
                return BadRequest("Invalid message id");
            }

            if (parentMessage.Role != DBChatRole.User)
            {
                return BadRequest("Parent message is not user message");
            }
        }
        else
        {
            // insert new user message
            dbUserMessage = new()
            {
                ChatId = req.ChatId,
                ChatRoleId = (byte)DBChatRole.User,
                MessageContents = request.UserMessage!.ToMessageContents(idEncryption),
                CreatedAt = DateTime.UtcNow,
                ParentId = req.MessageId,
            };
            db.Messages.Add(dbUserMessage);
            additionalMessages.Add(MessageLiteDto.FromDB(dbUserMessage));
        }

        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        string stopId = stopService.CreateAndCombineCancellationToken(ref cancellationToken);
        await YieldResponse(SseResponseLine.StopId(stopId));

        UserBalance userBalance = await db.UserBalances.Where(x => x.UserId == currentUser.Id).SingleAsync(cancellationToken);

        IAsyncEnumerable<SseResponseLine>[] streams = req.Spans
            .ToAsyncEnumerable()
            .SelectAwait(async span =>
            {
                Dictionary<long, MessageLiteDto> filteredMessages = existingMessages
                    .Where(x => x.Value.SpanId == span.SpanId || x.Value.SpanId == null)
                    .ToDictionary(x => x.Key, x => x.Value);

                OpenAIChatMessage[] messageToSend = await ((MessageLiteDto[])
                [
                    ..additionalMessages.Where(x => x.Role == DBChatRole.System && x.SpanId == span.SpanId || x.SpanId == null),
                    ..GetMessageTree(existingMessages, req.MessageId),
                ])
                .ToAsyncEnumerable()
                .SelectAwait(async x => await x.ToOpenAI(fup, cancellationToken))
                .ToArrayAsync(cancellationToken);

                return ChatAsLine(
                    userModelManager,
                    spanModelMapping[span.SpanId],
                    req.ChatId,
                    span,
                    filteredMessages,
                    cancellationToken);
            })
            .ToArrayAsync();
        await foreach (SseResponseLine line in MergeAsyncStreams(streams))
        {
            await YieldResponse(line);
        }

        if (existingMessages.Count == 0)
        {
            chat.Title = request.UserMessage!.Text[..Math.Min(50, request.UserMessage.Text.Length)];
            await YieldTitle(chat.Title);
        }
        return new EmptyResult();
    }

    private async IAsyncEnumerable<SseResponseLine> ChatAsLine(
        OpenAIChatMessage[] messageToSend,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        InChatContext icc = new();

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
    }

    private static MessageLiteDto MakeSystemMessage(byte? spanId, ChatsDB db, DecryptedChatRequest req)
    {
        Message toBeInsert = new()
        {
            ChatId = req.ChatId,
            ChatRoleId = (byte)DBChatRole.System,
            MessageContents =
            [
                MessageContent.FromText(req.Spans[0].SystemPrompt!)
            ],
            CreatedAt = DateTime.UtcNow,
            SpanId = spanId,
        };
        db.Messages.Add(toBeInsert);
        return MessageLiteDto.FromDB(toBeInsert);
    }

    static IAsyncEnumerable<T> MergeAsyncStreams<T>(params IAsyncEnumerable<T>[] streams)
    {
        var channel = Channel.CreateUnbounded<T>();
        int remainingStreams = streams.Length;

        foreach (IAsyncEnumerable<T> stream in streams)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await foreach (T item in stream)
                    {
                        await channel.Writer.WriteAsync(item);
                    }
                }
                finally
                {
                    if (Interlocked.Decrement(ref remainingStreams) == 0)
                    {
                        channel.Writer.Complete();
                    }
                }
            });
        }

        return ReadAllAsync(channel.Reader);
    }

    static async IAsyncEnumerable<T> ReadAllAsync<T>(ChannelReader<T> reader)
    {
        while (await reader.WaitToReadAsync())
        {
            while (reader.TryRead(out T? item))
            {
                yield return item;
            }
        }
    }

    private async Task YieldTitle(string title)
    {
        await YieldResponse(SseResponseLine.UpdateTitle(""));
        foreach (string segment in TestChatService.UnicodeCharacterSplit(title))
        {
            await YieldResponse(SseResponseLine.TitleSegment(segment));
            await Task.Delay(10);
        }
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data: "u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lfu8 = "\r\n\r\n"u8.ToArray();

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
