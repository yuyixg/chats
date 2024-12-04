using Chats.BE.Services.UrlEncryption;

namespace Chats.BE.Services.FileServices.Implementations.Local;

public class LocalFileService(string localFolder, HostUrlService hostUrlservice, IUrlEncryptionService urlEncryption) : IFileService
{
    public Uri CreateDownloadUrl(CreateDownloadUrlRequest request)
    {
        TimedId timedId = TimedId.CreateFor(request.FileId, request.ValidPeriod);
        string path = urlEncryption.CreateFileIdPath(timedId);
        return new Uri($"{hostUrlservice.GetBEUrl()}/api/file/{path}");
    }

    public Task<Stream> Download(string storageKey, CancellationToken cancellationToken)
    {
        string localPath = Path.Combine(localFolder, storageKey);
        return Task.FromResult<Stream>(File.OpenRead(localPath));
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
