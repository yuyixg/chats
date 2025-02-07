namespace Chats.BE.DB.Enums;

/// <summary>
/// Represents the content type of a database message.
/// </summary>
public enum DBMessageContentType : byte
{
    /// <summary>
    /// Error content type, stored in MessageContentText table
    /// </summary>
    Error = 0,

    /// <summary>
    /// Text content type, stored in MessageContentText table
    /// </summary>
    Text = 1,

    /// <summary>
    /// File ID content type, stored in MessageContentFile table
    /// </summary>
    FileId = 2,

    /// <summary>
    /// Reasoning content type, stored in MessageContentText table
    Think = 3,
}
