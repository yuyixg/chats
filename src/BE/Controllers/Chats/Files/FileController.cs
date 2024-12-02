using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.IdEncryption;
using Chats.BE.Services.ImageInfo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing;

namespace Chats.BE.Controllers.Chats.Files;

[Route("api")]
public class FileController(ChatsDB db, FileServiceFactory fileServiceFactory, CurrentUser currentUser, IIdEncryptionService idEncryptionService, ILogger<FileController> logger) : ControllerBase
{
    //[Route("{fileServiceId:int}"), HttpPost]
    //public async Task<ActionResult<FileUrlsDto>> GetFileUrls(
    //    int fileServiceId, 
    //    [FromBody] GetFileUrlsRequest fileInfo, 
    //    CancellationToken cancellationToken)
    //{
    //    FileService? fileService = await db.FileServices
    //        .FindAsync([fileServiceId], cancellationToken);
    //    if (fileService == null)
    //    {
    //        return NotFound("File server config not found.");
    //    }

    //    if (fileService.FileServiceTypeId != (byte)DBFileServiceType.Minio)
    //    {
    //        return this.BadRequestMessage("Unsupported file service type: " + fileService.FileServiceTypeId);
    //    }

    //    JsonMinioConfig config = JsonMinioConfig.Parse(fileService.Configs);
    //    using AmazonS3Client s3 = new(config.AccessKey, config.AccessSecret, new AmazonS3Config
    //    {
    //        ForcePathStyle = true, 
    //        ServiceURL = config.Endpoint
    //    });

    //    string key = $"{DateTime.Now:yyyy/MM/dd}/{fileInfo}";
    //    string putUrl = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
    //    {
    //        BucketName = config.BucketName,
    //        Key = key,
    //        Expires = DateTime.UtcNow.AddMinutes(5),
    //        Verb = HttpVerb.PUT
    //    });
    //    string getUrl = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
    //    {
    //        BucketName = config.BucketName,
    //        Key = key,
    //        Expires = DateTime.UtcNow.AddDays(7),
    //        Verb = HttpVerb.GET
    //    });

    //    return Ok(new FileUrlsDto
    //    { 
    //        GetUrl = getUrl,
    //        PutUrl = putUrl,
    //    });
    //}

    [Route("file-service/{fileServiceId:int}/file"), HttpPost]
    public async Task<ActionResult<string>> Upload(int fileServiceId, IFormFile file, [FromServices] ClientInfoManager clientInfoManager, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest("File is empty.");
        }
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File is too large.");
        }

        FileService? fileService = await db.FileServices.FindAsync([fileServiceId], cancellationToken);
        if (fileService == null)
        {
            return NotFound("File server config not found.");
        }

        IFileService fs = fileServiceFactory.Create((DBFileServiceType)fileService.FileServiceTypeId, fileService.Configs);
        using Stream baseStream = file.OpenReadStream();
        using PartialBufferedStream pbStream = new(baseStream, 4 * 1024);
        string storageKey = await fs.Upload(file.ContentType, baseStream, cancellationToken);
        DB.File dbFile = new()
        {
            FileName = file.FileName,
            FileContentType = await GetOrCreateDBContentType(file.ContentType, cancellationToken),
            FileServiceId = fileServiceId,
            StorageKey = storageKey,
            Size = (int)file.Length,
            ClientInfo = await clientInfoManager.GetClientInfo(cancellationToken),
            CreateUserId = currentUser.Id,
            CreatedAt = DateTime.UtcNow,
            FileImageInfo = GetImageInfo(file.FileName, file.ContentType, pbStream.SeekedBytes)
        };
        db.Files.Add(dbFile);
        await db.SaveChangesAsync(cancellationToken);

        return Created(default(string), value: dbFile.Id);
    }

    [Route("file/{fileId:int}"), HttpGet]
    public async Task<ActionResult> Download(int fileId, CancellationToken cancellationToken)
    {
        DB.File? file = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);
        if (file == null)
        {
            return NotFound("File not found.");
        }

        DBFileServiceType fileServiceType = (DBFileServiceType)file.FileService.FileServiceTypeId;
        IFileService fs = fileServiceFactory.Create(fileServiceType, file.FileService.Configs);
        if (fileServiceType == DBFileServiceType.Local)
        {
            return PhysicalFile(Path.Combine(file.FileService.Configs, file.StorageKey), file.FileContentType.ContentType);
        }
        else
        {
            string downloadUrl = fs.CreateDownloadUrl(file.StorageKey);
            return Redirect(downloadUrl);
        }
    }

    private FileImageInfo? GetImageInfo(string fileName, string contentType, byte[] imageFirst4KBytes)
    {
        try
        {
            IImageInfoService iis = ImageInfoFactory.CreateImageInfoService(contentType);
            Size size = iis.GetImageSize(imageFirst4KBytes);
            return new FileImageInfo
            {
                Width = size.Width,
                Height = size.Height
            };
        }
        catch (Exception e)
        {
            logger.LogWarning(e, "Failed to get image size for {fileName}({contentType})", fileName, contentType);
            return null;
        }
    }

    private async Task<FileContentType> GetOrCreateDBContentType(string contentType, CancellationToken cancellationToken)
    {
        FileContentType? dbContentType = await db.FileContentTypes.FirstOrDefaultAsync(x => x.ContentType == contentType, cancellationToken);
        if (dbContentType == null)
        {
            dbContentType = new FileContentType
            {
                ContentType = contentType
            };
            db.FileContentTypes.Add(dbContentType);
            await db.SaveChangesAsync(cancellationToken);
        }
        return dbContentType;
    }
}
