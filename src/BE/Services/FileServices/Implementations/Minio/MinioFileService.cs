
namespace Chats.BE.Services.FileServices.Implementations.Minio;

public class MinioFileService(MinioConfig minioConfig) : IFileService
{
    public string CreateDownloadUrl(string storageKey)
    {
        throw new NotImplementedException();
    }

    public Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
