using Chats.BE.DB.Enums;
using Chats.BE.Services.FileServices;
using OpenAI.Chat;

namespace Chats.BE.DB;

public partial class MessageContent
{
    public async Task<ChatMessageContentPart> ToOpenAI(FileUrlProvider fup, CancellationToken cancellationToken)
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(MessageContentUtf16!.Content),
            DBMessageContentType.FileId => await fup.CreateOpenAIPart(MessageContentFile!, cancellationToken),
            _ => throw new NotImplementedException()
        };
    }

    public override string ToString()
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => MessageContentUtf16!.Content,
            DBMessageContentType.Error => MessageContentUtf8!.Content,
            //DBMessageContentType.FileId => MessageContentUtil.ReadFileId(Content).ToString(), // not supported
            _ => throw new NotSupportedException(),
        };
    }

    public static MessageContent FromText(string text)
    {
        return new MessageContent { MessageContentUtf16 = new() { Content = text }, ContentTypeId = (byte)DBMessageContentType.Text };
    }

    public static MessageContent FromFileId(int fileId)
    {
        return new MessageContent { MessageContentFile = new() { FileId = fileId }, ContentTypeId = (byte)DBMessageContentType.FileId };
    }

    public static MessageContent FromError(string error)
    {
        return new MessageContent { MessageContentUtf8 = new() { Content = error }, ContentTypeId = (byte)DBMessageContentType.Error };
    }
}
