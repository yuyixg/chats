

namespace Chats.BE.Services.FileServices.Implementations.AliyunOSS;

public class AliyunOSSFileService(AliyunOssConfig aliyunOssConfig) : IFileService
{
    public Uri CreateDownloadUrl(CreateDownloadUrlRequest req)
    {
        throw new NotImplementedException();
    }

    public Task<Stream> Download(string storageKey, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
