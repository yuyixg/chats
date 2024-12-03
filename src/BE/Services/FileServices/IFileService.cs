namespace Chats.BE.Services.FileServices;

public interface IFileService
{
    Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken);
    Uri CreateDownloadUrl(CreateDownloadUrlRequest request);
}
