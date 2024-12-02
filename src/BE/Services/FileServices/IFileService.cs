namespace Chats.BE.Services.FileServices;

public interface IFileService
{
    Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken);
    string CreateDownloadUrl(string storageKey);
}
