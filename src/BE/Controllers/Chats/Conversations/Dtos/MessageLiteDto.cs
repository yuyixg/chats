using Chats.BE.DB.Enums;
using Chats.BE.DB.Extensions;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.FileServices;
using OpenAI.Chat;

namespace Chats.BE.Controllers.Chats.Conversations.Dtos;

public record MessageLiteDto
{
    public required long Id { get; init; }
    public required long? ParentId { get; init; }
    public required DBChatRole Role { get; init; }
    public required DBMessageSegment[] Content { get; init; }

    public async Task<ChatMessage> ToOpenAI(FileUrlProvider fileDownloadUrlProvider, CancellationToken cancellationToken)
    {
        return Role switch
        {
            DBChatRole.System => new SystemChatMessage(Content[0].ToString()),
            DBChatRole.User => new UserChatMessage(await Content
                .ToAsyncEnumerable()
                .SelectAwait(async c => await c.ToOpenAI(fileDownloadUrlProvider, cancellationToken))
                .ToArrayAsync(cancellationToken)),
            DBChatRole.Assistant => new AssistantChatMessage(await Content
                .Where(x => x.ContentType != DBMessageContentType.Error)
                .ToAsyncEnumerable()
                .SelectAwait(async x => await x.ToOpenAI(fileDownloadUrlProvider, cancellationToken))
                .ToArrayAsync(cancellationToken)),
            _ => throw new NotImplementedException()
        };
    }
}

public record DBMessageSegment
{
    public required DBMessageContentType ContentType { get; init; }

    public required byte[] Content { get; init; }

    public async Task<ChatMessageContentPart> ToOpenAI(FileUrlProvider fdup, CancellationToken cancellationToken)
    {
        return ContentType switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(ToString()),
            DBMessageContentType.FileId => ChatMessageContentPart.CreateImagePart(await fdup.CreateUrl(MessageContentUtil.ReadFileId(Content), cancellationToken)),
            _ => throw new NotImplementedException()
        };
    }

    public override string ToString()
    {
        return ContentType switch
        {
            DBMessageContentType.Text => MessageContentUtil.ReadText(Content),
            DBMessageContentType.Error => MessageContentUtil.ReadError(Content),
            //DBMessageContentType.FileId => MessageContentUtil.ReadFileId(Content).ToString(), // not supported
            _ => throw new NotSupportedException(),
        };
    }
}
