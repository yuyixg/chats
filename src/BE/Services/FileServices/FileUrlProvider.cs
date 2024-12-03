using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services.UrlEncryption;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.FileServices;

public class FileUrlProvider(ChatsDB db, FileServiceFactory fileServiceFactory, IUrlEncryptionService urlEncryptionService, CurrentUser currentUser)
{
    public async Task<Uri> CreateUrl(int fileId, CancellationToken cancellationToken)
    {
        DB.File? file = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);

        if (file == null)
        {
            throw new Exception("File not found.");
        }
        return CreateUrl(file);
    }

    public Uri CreateUrl(DB.File file)
    {
        if (file.CreateUserId != currentUser.Id && !currentUser.IsAdmin)
        {
            // only the creator or admin can download the file
            throw new Exception("File not found.");
        }

        DBFileServiceType fileServiceType = (DBFileServiceType)file.FileService.FileServiceTypeId;
        IFileService fs = fileServiceFactory.Create(fileServiceType, file.FileService.Configs);
        Uri downloadUrl = fs.CreateDownloadUrl(CreateDownloadUrlRequest.FromFile(file));
        return downloadUrl;
    }

    public async Task<FileDto> CreateFileDto(int fileId, CancellationToken cancellationToken)
    {
        return new FileDto
        {
            Id = urlEncryptionService.EncryptFileId(fileId),
            Url = await CreateUrl(fileId, cancellationToken)
        };
    }

    public FileDto CreateFileDto(DB.File file)
    {
        return new FileDto
        {
            Id = urlEncryptionService.EncryptFileId(file.Id),
            Url = CreateUrl(file)
        };
    }

    public async Task<FileDto[]> CreateFileDtos(int[] fileIds, CancellationToken cancellationToken)
    {
        Dictionary<int, DB.File> files = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .Where(x => fileIds.Contains(x.Id))
            .ToDictionaryAsync(k => k.Id, v => v, cancellationToken);

        Dictionary<int, Uri?> fileUrls = fileIds.ToDictionary(x => x, x => files.TryGetValue(x, out DB.File? file) ? CreateUrl(file) : default);

        return fileIds.Select((x, i) => new FileDto
        {
            Id = urlEncryptionService.EncryptFileId(x),
            Url = fileUrls[x] ?? new Uri("about:blank")
        }).ToArray();
    }
}
