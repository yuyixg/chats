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
public class ChatController(ChatStopService stopService) : ControllerBase
{
    [HttpPost("fresh-chat-message")]
    public async Task<IActionResult> FreshChat(
        [FromBody] FreshChatRequest req,
        [FromServices] ChatsDB db,
        [FromServices] CurrentUser currentUser,
        [FromServices] ILogger<ChatController> logger,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] BalanceService balanceService,
        [FromServices] ChatFactory chatFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // ensure request span id is unique
        if (req.Spans.Select(x => x.Id).Distinct().Count() != req.Spans.Length)
        {
            return BadRequest("Duplicate span id");
        }

        return await ChatPrivate(
            req.ToChatRequest(),
            db, currentUser, logger, idEncryption, balanceService, chatFactory, userModelManager, clientInfoManager, fup,
            cancellationToken);
    }

    [HttpPost("regenerate-assistant-message")]
    public async Task<IActionResult> RegenerateMessage(
        [FromBody] RegenerateAssistantMessageRequest req,
        [FromServices] ChatsDB db,
        [FromServices] CurrentUser currentUser,
        [FromServices] ILogger<ChatController> logger,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] BalanceService balanceService,
        [FromServices] ChatFactory chatFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return await ChatPrivate(
            req.ToChatRequest(),
            db, currentUser, logger, idEncryption, balanceService, chatFactory, userModelManager, clientInfoManager, fup,
            cancellationToken);
    }

    [HttpPost("general-chat")]
    public async Task<IActionResult> GeneralChat(
        [FromBody] GeneralChatRequest req,
        [FromServices] ChatsDB db,
        [FromServices] CurrentUser currentUser,
        [FromServices] ILogger<ChatController> logger,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] BalanceService balanceService,
        [FromServices] ChatFactory chatFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (req.SpanIds.Length == 0)
        {
            return BadRequest("Spans must be provided");
        }

        foreach (int spanId in req.SpanIds)
        {
            if (spanId >= byte.MinValue && spanId <= byte.MaxValue)
            {
                continue;
            }
            return BadRequest("Invalid span id");
        }

        // ensure request span id is unique
        if (req.SpanIds.Distinct().Count() != req.SpanIds.Length)
        {
            return BadRequest("Duplicate span id");
        }

        return await ChatPrivate(
            req.ToChatRequest(),
            db, currentUser, logger, idEncryption, balanceService, chatFactory, userModelManager, clientInfoManager, fup,
            cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> ChatPrivate(
        [FromBody] ChatRequest request,
        [FromServices] ChatsDB db,
        [FromServices] CurrentUser currentUser,
        [FromServices] ILogger<ChatController> logger,
        [FromServices] IUrlEncryptionService idEncryption,
        [FromServices] BalanceService balanceService,
        [FromServices] ChatFactory chatFactory,
        [FromServices] UserModelManager userModelManager,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fup,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // req.Spans should never be null
        if (request.Spans == null || request.Spans.Length == 0) return BadRequest("Spans must be provided");

        long firstTick = Stopwatch.GetTimestamp();
        DecryptedChatRequest req = request.Decrypt(idEncryption);

        // one of message id and user message must be non-null
        if (req.MessageId == null && req.UserMessage == null)
        {
            return BadRequest("Message id or user message must be provided");
        }

        Chat? chat = await db.Chats
            .Include(x => x.ChatSpans)
            .Include(x => x.Messages).ThenInclude(x => x.MessageContents).ThenInclude(x => x.MessageContentBlob)
            .Include(x => x.Messages).ThenInclude(x => x.MessageContents).ThenInclude(x => x.MessageContentFile)
                .ThenInclude(x => x!.File).ThenInclude(x => x.FileService)
            .Include(x => x.Messages).ThenInclude(x => x.MessageContents).ThenInclude(x => x.MessageContentFile)
                .ThenInclude(x => x!.File).ThenInclude(x => x.FileImageInfo)
            .Include(x => x.Messages).ThenInclude(x => x.MessageContents).ThenInclude(x => x.MessageContentText)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == req.ChatId && x.UserId == currentUser.Id, cancellationToken);
        if (chat == null)
        {
            return NotFound();
        }

        Dictionary<long, MessageLiteDto> existingMessages = chat.Messages
            .Select(x => new MessageLiteDto()
            {
                Id = x.Id,
                Content = [.. x.MessageContents.OrderBy(x => x.Id)],
                Role = (DBChatRole)x.ChatRoleId,
                ParentId = x.ParentId,
                SpanId = x.SpanId,
            })
            .ToDictionary(x => x.Id, x => x);

        // insert system message if it doesn't exist
        bool isEmptyChat = existingMessages.Count == 0;
        if (isEmptyChat && (req.Spans == null || req.Spans.Length == 0))
        {
            return BadRequest("Empty chat must have at least one span");
        }
        MessageLiteDto[] systemMessages = GetSystemMessages(chat, req.Spans, existingMessages, isEmptyChat);

        // ensure chat.ChatSpan contains all span ids that in request, otherwise return error
        if (req.Spans!.Any(x => !chat.ChatSpans.Any(y => y.SpanId == x.Id)))
        {
            return BadRequest("Invalid span id");
        }

        // get span id -> model id mapping but request only contains span id, so we need to get model id from chat.ChatSpan
        Dictionary<byte, short> spanModelMapping = req.Spans.ToDictionary(x => x.Id, x => x.ModelId ?? chat.ChatSpans.First(y => y.SpanId == x.Id).ModelId);
        Dictionary<short, UserModel> userModels = await userModelManager.GetUserModels(currentUser.Id, [.. spanModelMapping.Values], cancellationToken);
        // ensure spanModelMapping contains all userModels
        if (spanModelMapping.Values.Any(x => !userModels.ContainsKey(x)))
        {
            return BadRequest("Invalid span model");
        }

        Message? dbUserMessage = null;
        if (req.MessageId != null)
        {
            if (!existingMessages.TryGetValue(req.MessageId.Value, out MessageLiteDto? parentMessage))
            {
                return BadRequest("Invalid message id");
            }
            else if (parentMessage.Role == DBChatRole.User)
            {
                // kind: RegenerateAssistantMessageRequest
            }
            else if (parentMessage.Role == DBChatRole.Assistant)
            {
                // kind: EditUserMessageRequest
                dbUserMessage = MakeDbUserMessage(chat, idEncryption, req);
            }
        }
        else
        {
            // kind: NewMessageRequest
            dbUserMessage = MakeDbUserMessage(chat, idEncryption, req);
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
                GetMessageTree(existingMessages, req.MessageId),
                systemMessages.Where(x => x.Role == DBChatRole.System && x.SpanId == span.Id || x.SpanId == null).ToArray(),
                dbUserMessage,
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
            chat.Messages.Add(resp.AssistantMessage);
        }
        if (isEmptyChat) chat.Title = request.UserMessage!.Text[..Math.Min(50, request.UserMessage.Text.Length)];
        chat.LeafMessage = resps.Last().AssistantMessage;
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
        await YieldResponse(SseResponseLine.ChatLeafMessageId(chat.LeafMessageId!.Value, idEncryption));

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
        if (isEmptyChat) await YieldTitle(chat.Title);
        return new EmptyResult();
    }

    private static MessageLiteDto[] GetSystemMessages(Chat chat, InternalChatSpanRequest[]? spans, Dictionary<long, MessageLiteDto> existingMessages, bool isEmptyChat)
    {
        if (isEmptyChat)
        {
            if (spans == null || spans.Length == 0)
            {
                throw new ArgumentException("Empty chat must have at least one span");
            }

            if (spans.Select(x => x.SystemPrompt).Distinct().Count() == 1 && spans[0].SystemPromptValid)
            {
                // only insert null spaned system message if all prompts are the same
                return [MakeSystemMessage(null, chat, spans[0])];
            }
            else
            {
                return spans
                    .Where(x => !string.IsNullOrWhiteSpace(x.SystemPrompt))
                    .Select(x => MakeSystemMessage(x.Id, chat, x))
                    .ToArray();
            }
        }
        else
        {
            return existingMessages.Values
                .Where(x => x.Role == DBChatRole.System)
                .ToArray();
        }
    }

    private static Message MakeDbUserMessage(Chat chat, IUrlEncryptionService idEncryption, DecryptedChatRequest req)
    {
        // insert new user message
        Message? dbUserMessage = new()
        {
            ChatRoleId = (byte)DBChatRole.User,
            MessageContents = req.UserMessage!.ToMessageContents(idEncryption),
            CreatedAt = DateTime.UtcNow,
            ParentId = req.MessageId,
        };
        chat.Messages.Add(dbUserMessage);
        return dbUserMessage;
    }

    private static async Task<ChatSpanResponse> ProcessChatSpan(
        CurrentUser currentUser,
        ILogger<ChatController> logger,
        ChatFactory chatFactory,
        FileUrlProvider fup,
        InternalChatSpanRequest span,
        long firstTick,
        DecryptedChatRequest req,
        Chat chat,
        UserModel userModel,
        IEnumerable<MessageLiteDto> messageTree,
        MessageLiteDto[] systemMessages,
        Message? dbUserMessage,
        UserBalance userBalance,
        Task<ClientInfo> clientInfoTask,
        ChannelWriter<SseResponseLine> writer,
        CancellationToken cancellationToken)
    {
        OpenAIChatMessage[] messageToSend = await ((IEnumerable<MessageLiteDto>)
        [
            ..systemMessages,
            ..messageTree,
            ..(dbUserMessage != null ? [MessageLiteDto.FromDB(dbUserMessage)] : Array.Empty<MessageLiteDto>()),
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
            SpanId = span.Id,
            CreatedAt = DateTime.UtcNow,
        };
        if (dbUserMessage != null)
        {
            dbAssistantMessage.Parent = dbUserMessage;
        }
        else
        {
            dbAssistantMessage.ParentId = req.MessageId;
        }

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

    private static MessageLiteDto MakeSystemMessage(byte? specifiedSpanId, Chat chat, InternalChatSpanRequest span)
    {
        if (specifiedSpanId != null && specifiedSpanId != span.Id)
        {
            throw new ArgumentException("specifiedSpanId must be null or equal to span.Id");
        }

        Message toBeInsert = new()
        {
            ChatRoleId = (byte)DBChatRole.System,
            MessageContents =
            [
                MessageContent.FromText(span.SystemPrompt!)
            ],
            CreatedAt = DateTime.UtcNow,
            SpanId = specifiedSpanId,
        };
        chat.Messages.Add(toBeInsert);
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
