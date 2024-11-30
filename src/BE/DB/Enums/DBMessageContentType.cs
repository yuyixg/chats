namespace Chats.BE.DB.Enums;

/// <summary>
/// Represents the content type of a database message.
/// </summary>
public enum DBMessageContentType : byte
{
    /// <summary>
    /// Error content type encoded in UTF-8.
    /// </summary>
    Error = 0,

    /// <summary>
    /// Text content type encoded in Unicode.
    /// </summary>
    Text = 1,

    /// <summary>
    /// Image URL content type encoded in UTF-8.
    /// </summary>
    ImageUrl = 2,

    /// <summary>
    /// 32bit little-endian integer file ID content type.
    /// </summary>
    FileId = 3,
}
