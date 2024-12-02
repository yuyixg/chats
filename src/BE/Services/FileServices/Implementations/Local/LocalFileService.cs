

namespace Chats.BE.Services.FileServices.Implementations.Local;

public class LocalFileService(string localFolder) : IFileService
{
    public string CreateDownloadUrl(string storageKey)
    {
        // This method is not supported for LocalFileService
        throw new NotSupportedException();
    }

    public async Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken)
    {
        SuggestedStorageInfo suggestedStorageInfo = SuggestedStorageInfo.FromFileName(request.FileName);
        string folderPath = Path.Combine(localFolder, suggestedStorageInfo.Folder);
        Directory.CreateDirectory(folderPath);

        string filePath = Path.Combine(folderPath, suggestedStorageInfo.FileName);
        using FileStream fileStream = File.Create(filePath);
        await request.Stream.CopyToAsync(fileStream, cancellationToken);

        return suggestedStorageInfo.StorageKey;
    }
}
