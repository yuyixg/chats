
namespace Chats.BE.Services.FileServices.Implementations.AwsS3;

public class AwsS3FileService(AwsS3Config awsS3Config) : IFileService
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
