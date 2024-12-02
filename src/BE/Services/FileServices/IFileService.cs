namespace Chats.BE.Services.FileServices;

public interface IFileService
{
    Task<string> Upload(string contentType, Stream stream, CancellationToken cancellationToken);
    string CreateDownloadUrl(string storageKey);
}
