using Microsoft.IdentityModel.Tokens;

namespace Chats.BE.Services.FileServices;

public record FileUploadRequest
{
    public required string FileName { get; init; }
    public required string ContentType { get; init; }
    public required Stream Stream { get; init; }
}

public record CreateDownloadUrlRequest
{
    public required int FileId { get; init; }
    public required string StorageKey { get; init; }

    public TimeSpan ValidPeriod { get; init; } = TimeSpan.FromHours(2);

    public static CreateDownloadUrlRequest FromFile(DB.File file)
    {
        return new CreateDownloadUrlRequest { FileId = file.Id, StorageKey = file.StorageKey };
    }
}

public record SuggestedStorageInfo(string Folder, string FileName)
{
    public string StorageKey { get; } = $"{Folder}/{FileName}";

    public static SuggestedStorageInfo FromFileName(string fileName)
    {
        DateTime now = DateTime.UtcNow;
        string safeFileName = Path.GetFileName(fileName);
        string randomStuff = Base64UrlEncoder.Encode(Guid.NewGuid().ToByteArray());
        return new SuggestedStorageInfo($"{now:yyyy}/{now:MM}/{now:dd}", $"{randomStuff}-{safeFileName}");
    }
}
