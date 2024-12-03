
namespace Chats.BE.Services.FileServices.Implementations.Minio;

public class MinioFileService(MinioConfig minioConfig) : IFileService
{
    public Uri CreateDownloadUrl(CreateDownloadUrlRequest req)
    {
        throw new NotImplementedException();
    }

    public Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
