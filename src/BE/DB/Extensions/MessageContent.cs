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
            DBMessageContentType.Text => ChatMessageContentPart.CreateTextPart(MessageContentText!.Content),
            DBMessageContentType.FileId => await fup.CreateOpenAIPart(MessageContentFile, cancellationToken),
            _ => throw new NotImplementedException()
        };
    }

    public override string ToString()
    {
        return (DBMessageContentType)ContentTypeId switch
        {
            DBMessageContentType.Text => MessageContentText!.Content,
            DBMessageContentType.Error => MessageContentText!.Content,
            //DBMessageContentType.FileId => MessageContentUtil.ReadFileId(Content).ToString(), // not supported
            _ => throw new NotSupportedException(),
        };
    }

    public static MessageContent FromText(string text)
    {
        return new MessageContent { MessageContentText = new() { Content = text }, ContentTypeId = (byte)DBMessageContentType.Text };
    }

    public static MessageContent FromFile(int fileId, File file)
    {
        return new MessageContent { MessageContentFile = new() { FileId = fileId, File = file }, ContentTypeId = (byte)DBMessageContentType.FileId };
    }

    public static MessageContent FromError(string error)
    {
        return new MessageContent { MessageContentText = new() { Content = error }, ContentTypeId = (byte)DBMessageContentType.Error };
    }
}
