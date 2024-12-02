using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.FileServices;

public class FileDownloadUrlProvider(ChatsDB db, FileServiceFactory fileServiceFactory, CurrentUser currentUser)
{
    public async Task<string> GetDownloadUrlForFileId(int fileId, CancellationToken cancellationToken)
    {
        DB.File? file = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);

        if (file == null)
        {
            throw new Exception("File not found.");
        }
        if (file.CreateUserId != currentUser.Id && !currentUser.IsAdmin)
        {
            // only the creator or admin can download the file
            throw new Exception("File not found.");
        }

        DBFileServiceType fileServiceType = (DBFileServiceType)file.FileService.FileServiceTypeId;
        IFileService fs = fileServiceFactory.Create(fileServiceType, file.FileService.Configs);
        string downloadUrl = fs.CreateDownloadUrl(file.StorageKey);
        return downloadUrl;
    }
}
