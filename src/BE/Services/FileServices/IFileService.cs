using Chats.BE.DB;
using Chats.BE.Infrastructure;

namespace Chats.BE.Services.FileServices;

public interface IFileService
{
    Task<string> Upload(string contentType, byte[] fileBytes, CancellationToken cancellationToken);
    string CreateDownloadUrl(string storageKey);
}

public class FileServiceUtil(ChatsDB db, ClientInfoManager clientInfoManager, CurrentUser currentUser)
{
    public async Task<DB.File> Upload(int fileServiceId, IFormFile file, CancellationToken cancellationToken)
    {
        
    }

    
}