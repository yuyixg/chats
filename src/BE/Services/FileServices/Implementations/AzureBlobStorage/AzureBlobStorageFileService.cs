
namespace Chats.BE.Services.FileServices.Implementations.AzureBlobStorage;

public class AzureBlobStorageFileService(string azureStorageConnectionString) : IFileService
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
