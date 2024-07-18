using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using DBChatMessage = Chats.BE.DB.ChatMessage;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats2"), Authorize]
public class ConversationController(ChatsDB db, CurrentUser currentUser) : ControllerBase
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

        UserModel userModel = await db.UserModels
            .Where(x => x.UserId == currentUser.Id)
            .SingleAsync(cancellationToken);
        JsonUserModel[] userModelConfigs = JsonSerializer.Deserialize<JsonUserModel[]>(userModel.Models)!;
        JsonUserModel? userModelConfig = userModelConfigs.FirstOrDefault(x => x.ModelId == request.ModelId);
        UserBalance userBalance = await db.UserBalances
            .Where(x => x.UserId == currentUser.Id)
            .SingleAsync(cancellationToken);
        if (userModelConfig == null)
        {
            return BadRequest("User model not found");
        }
        if (!userModelConfig.Enabled)
        {
            return BadRequest("User model is disabled");
        }
        if (DateTime.Parse(userModelConfig.Expires) < DateTime.UtcNow)
        {
            return BadRequest("User model is expired");
        }
        if (userModelConfig.Counts == "0" && userModelConfig.Tokens == "0" && userBalance.Balance == 0)
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
        ConversationSegment? lastSegment = null;
        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        ReadOnlyMemory<byte> dataU8 = "data:"u8.ToArray();
        ReadOnlyMemory<byte> lfu8 = "\n"u8.ToArray();
        StringBuilder responseText = new();
        try
        {
            Stopwatch sw = Stopwatch.StartNew();
            await foreach (ConversationSegment seg in s.ChatStreamed(messageLine, request.UserModelConfig, cancellationToken))
            {
                lastSegment = seg;
                SseResponseLine responseObj = new() { Result = seg.TextSegment, Success = true };
                await Response.Body.WriteAsync(dataU8);
                await Response.Body.WriteAsync(JsonSerializer.SerializeToUtf8Bytes(responseObj));
                await Response.Body.WriteAsync(lfu8);
                await Response.Body.FlushAsync();
                responseText.Append(seg.TextSegment);
            }
            int elapsedMs = (int)sw.ElapsedMilliseconds;

            if (lastSegment != null)
            {
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
                    //InputPrice = lastSegment.InputPrice,
                };
                db.ChatMessages.Add(assistantMessage);
            }
            return new EmptyResult();
        }
        catch (Exception)
        {
            throw new NotImplementedException();
        }
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