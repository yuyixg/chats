using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Extensions;
using Chats.BE.Services.FileServices;
using OpenAI.Chat;

namespace Chats.BE.DB;

public partial class MessageContent
{
    public async Task<ChatMessageContentPart> ToOpenAI(FileUrlProvider fup, CancellationToken cancellationToken)
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(MessageContentUtil.ReadText(Content)),
            DBMessageContentType.FileId => ChatMessageContentPart.CreateImagePart(await fup.CreateUrl(MessageContentUtil.ReadFileId(Content), cancellationToken)),
            _ => throw new NotImplementedException()
        };
    }

    public DBMessageSegment ToSegment()
    {
        return new DBMessageSegment
        {
            ContentType = (DBMessageContentType)ContentTypeId,
            Content = Content
        };
    }

    public static MessageContent FromText(string text)
    {
        return new MessageContent { Content = MessageContentUtil.WriteText(text), ContentTypeId = (byte)DBMessageContentType.Text };
    }

    public static MessageContent FromFileId(int fileId)
    {
        return new MessageContent { Content = MessageContentUtil.WriteFileId(fileId), ContentTypeId = (byte)DBMessageContentType.FileId };
    }

    public static MessageContent FromError(string error)
    {
        return new MessageContent { Content = MessageContentUtil.WriteError(error), ContentTypeId = (byte)DBMessageContentType.Error };
    }
}
