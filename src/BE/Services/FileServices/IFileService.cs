namespace Chats.BE.Services.FileServices;

public interface IFileService
{
    Task<string> Upload(string contentType, byte[] fileBytes, CancellationToken cancellationToken);
    string CreateDownloadUrl(string storageKey);
}
