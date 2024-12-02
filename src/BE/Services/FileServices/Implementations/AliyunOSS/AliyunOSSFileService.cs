
namespace Chats.BE.Services.FileServices.Implementations.AliyunOSS;

public class AliyunOSSFileService(AliyunOssConfig aliyunOssConfig) : IFileService
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
