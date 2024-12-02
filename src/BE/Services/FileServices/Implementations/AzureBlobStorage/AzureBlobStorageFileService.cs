
namespace Chats.BE.Services.FileServices.Implementations.AzureBlobStorage;

public class AzureBlobStorageFileService(string azureStorageConnectionString) : IFileService
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
