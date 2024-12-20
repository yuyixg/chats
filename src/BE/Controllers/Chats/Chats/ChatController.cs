using Chats.BE.Controllers.Chats.Chats.Dtos;
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
using System.Diagnostics;
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
        [FromServices] ChatFactory chatFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        long firstTick = Stopwatch.GetTimestamp();
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
        if (req.Spans.Select(x => x.Id).Distinct().Count() != req.Spans.Length)
        {
            return BadRequest("Duplicate span id");
        }

        // ensure chat.ChatSpan contains all span ids that in request, otherwise return error
        if (req.Spans.Any(x => !chat.ChatSpans.Any(y => y.SpanId == x.Id)))
        {
            return BadRequest("Invalid span id");
        }

        // get span id -> model id mapping but request only contains span id, so we need to get model id from chat.ChatSpan
        Dictionary<byte, short> spanModelMapping = req.Spans.ToDictionary(x => x.Id, x => chat.ChatSpans.First(y => y.SpanId == x.Id).ModelId);
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
        List<MessageLiteDto> systemMessages = new(capacity: req.Spans.Length + 1);
        if (existingMessages.Count == 0)
        {
            if (req.AllSystemPromptSame && req.Spans[0].SystemPromptValid)
            {
                // only insert null spaned system message if all prompts are the same
                systemMessages.Add(MakeSystemMessage(null, db, req));
            }
            else
            {
                foreach (ChatSpanRequest span in req.Spans)
                {
                    if (!string.IsNullOrWhiteSpace(span.SystemPrompt))
                    {
                        systemMessages.Add(MakeSystemMessage(span.Id, db, req));
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
            existingMessages.Add(dbUserMessage.Id, MessageLiteDto.FromDB(dbUserMessage));
        }

        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        string stopId = stopService.CreateAndCombineCancellationToken(ref cancellationToken);
        await YieldResponse(SseResponseLine.StopId(stopId));

        UserBalance userBalance = await db.UserBalances.Where(x => x.UserId == currentUser.Id).SingleAsync(cancellationToken);
        Task<ClientInfo> clientInfoTask = clientInfoManager.GetClientInfo(cancellationToken);

        Channel<SseResponseLine>[] channels = req.Spans.Select(x => Channel.CreateUnbounded<SseResponseLine>()).ToArray();
        Task<ChatSpanResponse>[] streamTasks = req.Spans
            .Select((span, index) => ProcessChatSpan(
                currentUser, 
                logger, 
                chatFactory, 
                fup, 
                span, 
                firstTick, 
                req, 
                chat,
                userModels[spanModelMapping[span.Id]],
                existingMessages, 
                systemMessages, 
                userBalance, 
                clientInfoTask,
                channels[index].Writer, 
                cancellationToken))
            .ToArray();
        await foreach (SseResponseLine line in MergeChannels(channels).Reader.ReadAllAsync(CancellationToken.None))
        {
            await YieldResponse(line);
        }
        cancellationToken = CancellationToken.None;
        stopService.Remove(stopId);
        ChatSpanResponse[] resps = await Task.WhenAll(streamTasks);
        foreach (ChatSpanResponse resp in resps)
        {
            db.Messages.Add(resp.AssistantMessage);
        }
        await db.SaveChangesAsync(cancellationToken);

        // yield end messages
        if (dbUserMessage != null)
        {
            await YieldResponse(SseResponseLine.UserMessage(dbUserMessage, idEncryption, fup));
        }
        foreach (ChatSpanResponse resp in resps)
        {
            await YieldResponse(SseResponseLine.ResponseMessage(resp.SpanId, resp.AssistantMessage, idEncryption, fup));
        }

        // finish costs
        if (resps.Any(x => x.Cost.CostBalance > 0))
        {
            await balanceService.UpdateBalance(db, currentUser.Id, cancellationToken);
        }
        if (resps.Any(x => x.Cost.CostUsage))
        {
            foreach (short modelId in userModels.Keys)
            {
                await balanceService.UpdateUsage(db, modelId, cancellationToken);
            }
        }

        // yield title
        if (existingMessages.Count == 0)
        {
            chat.Title = request.UserMessage!.Text[..Math.Min(50, request.UserMessage.Text.Length)];
            await YieldTitle(chat.Title);
        }
        return new EmptyResult();
    }

    private static async Task<ChatSpanResponse> ProcessChatSpan(
        CurrentUser currentUser, 
        ILogger<ChatController> logger, 
        ChatFactory chatFactory, 
        FileUrlProvider fup, 
        ChatSpanRequest span, 
        long firstTick, 
        DecryptedChatRequest req, 
        Chat chat, 
        UserModel userModel, 
        Dictionary<long, MessageLiteDto> existingMessages, 
        List<MessageLiteDto> systemMessages, 
        UserBalance userBalance, 
        Task<ClientInfo> clientInfoTask,
        ChannelWriter<SseResponseLine> writer, 
        CancellationToken cancellationToken)
    {
        Dictionary<long, MessageLiteDto> filteredMessages = existingMessages
            .Where(x => x.Value.SpanId == span.Id || x.Value.SpanId == null)
            .ToDictionary(x => x.Key, x => x.Value);

        OpenAIChatMessage[] messageToSend = await ((MessageLiteDto[])
        [
            ..systemMessages.Where(x => x.Role == DBChatRole.System && x.SpanId == span.Id || x.SpanId == null),
            ..GetMessageTree(existingMessages, req.MessageId),
        ])
        .ToAsyncEnumerable()
        .SelectAwait(async x => await x.ToOpenAI(fup, cancellationToken))
        .ToArrayAsync(cancellationToken);

        ChatCompletionOptions cco = span.ToChatCompletionOptions(currentUser.Id, chat.ChatSpans.First(cs => cs.SpanId == span.Id));

        InChatContext icc = new(firstTick);

        string? errorText = null;
        try
        {
            using ChatService s = chatFactory.CreateConversationService(userModel.Model);
            await foreach (InternalChatSegment seg in icc.Run(userBalance.Balance, userModel, s.ChatStreamedFEProcessed(messageToSend, cco, cancellationToken)))
            {
                if (seg.TextSegment == string.Empty) continue;
                await writer.WriteAsync(SseResponseLine.Segment(span.Id, seg.TextSegment), cancellationToken);

                if (cancellationToken.IsCancellationRequested)
                {
                    throw new TaskCanceledException();
                }
            }
        }
        catch (ChatServiceException cse)
        {
            icc.FinishReason = cse.ErrorCode;
            errorText = cse.Message;
        }
        catch (Exception e) when (e is DashScopeException or ClientResultException or TencentCloud.Common.TencentCloudSDKException)
        {
            icc.FinishReason = DBFinishReason.UpstreamError;
            errorText = e.Message;
            logger.LogError(e, "Upstream error: {userMessageId}", req.MessageId);
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
            logger.LogError(e, "Error in conversation for message: {userMessageId}", req.MessageId);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
        }

        // success
        // insert new assistant message
        Message dbAssistantMessage = new()
        {
            ChatId = chat.Id,
            ChatRoleId = (byte)DBChatRole.Assistant,
            MessageContents =
            [
                MessageContent.FromText(icc.FullResponse.TextSegment),
            ],
            CreatedAt = DateTime.UtcNow,
            ParentId = req.MessageId,
        };

        if (errorText != null)
        {
            dbAssistantMessage.MessageContents.Add(MessageContent.FromError(errorText));
            await writer.WriteAsync(SseResponseLine.Error(span.Id, errorText), cancellationToken);
        }
        dbAssistantMessage.Usage = icc.ToUserModelUsage(currentUser.Id, await clientInfoTask, isApi: false);
        writer.Complete();
        return new ChatSpanResponse()
        {
            AssistantMessage = dbAssistantMessage,
            Cost = icc.Cost,
            SpanId = span.Id,
        };
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

    static Channel<T> MergeChannels<T>(params Channel<T>[] channels)
    {
        Channel<T> outputChannel = Channel.CreateUnbounded<T>();
        int remainingChannels = channels.Length;

        foreach (Channel<T> channel in channels)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await foreach (var item in channel.Reader.ReadAllAsync())
                    {
                        await outputChannel.Writer.WriteAsync(item);
                    }
                }
                finally
                {
                    if (Interlocked.Decrement(ref remainingChannels) == 0)
                    {
                        outputChannel.Writer.Complete();
                    }
                }
            });
        }

        return outputChannel;
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
