using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.FileServices;
using Chats.BE.Services.UrlEncryption;
using Chats.BE.Services.ImageInfo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing;
using Microsoft.AspNetCore.Authorization;
using Chats.BE.Infrastructure.Functional;
using Chats.BE.Controllers.Chats.Messages.Dtos;
using Microsoft.Net.Http.Headers;

namespace Chats.BE.Controllers.Chats.Files;

[Route("api")]
public class FileController(ChatsDB db, FileServiceFactory fileServiceFactory, IUrlEncryptionService urlEncryption, ILogger<FileController> logger) : ControllerBase
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

    [Route("file-service/{fileServiceId:int}/upload"), HttpPut]
    public async Task<ActionResult<FileDto>> Upload(int fileServiceId, IFormFile file,
        [FromServices] ClientInfoManager clientInfoManager,
        [FromServices] FileUrlProvider fdup,
        [FromServices] CurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest("File is empty.");
        }
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File is too large.");
        }
        if (!string.IsNullOrWhiteSpace(file.FileName) && file.FileName.IndexOfAny(Path.GetInvalidFileNameChars()) != -1)
        {
            return BadRequest("Invalid file name.");
        }

        FileService? fileService = await db.FileServices.FindAsync([fileServiceId], cancellationToken);
        if (fileService == null)
        {
            return NotFound("File server config not found.");
        }
        if (!fileService.IsDefault && !currentUser.IsAdmin)
        {
            // only admin can upload to non-default file service
            return NotFound("File server config not found.");
        }

        IFileService fs = fileServiceFactory.Create((DBFileServiceType)fileService.FileServiceTypeId, fileService.Configs);
        using Stream baseStream = file.OpenReadStream();
        using PartialBufferedStream pbStream = new(baseStream, 4 * 1024);
        string storageKey = await fs.Upload(new FileUploadRequest
        {
            ContentType = file.ContentType,
            Stream = pbStream,
            FileName = file.FileName
        }, cancellationToken);
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


        FileDto fileDto = fdup.CreateFileDto(dbFile);
        return Created(fileDto.Url, value: fileDto);

        FileImageInfo? GetImageInfo(string fileName, string contentType, byte[] imageFirst4KBytes)
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

        async Task<FileContentType> GetOrCreateDBContentType(string contentType, CancellationToken cancellationToken)
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

    [Route("file/private/{encryptedFileId}"), HttpGet]
    public async Task<ActionResult> DownloadPrivate(string encryptedFileId,
        [FromServices] CurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        int fileId = urlEncryption.DecryptFileId(encryptedFileId);
        DB.File? file = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);
        if (file == null)
        {
            return NotFound("File not found.");
        }
        if (file.CreateUserId != currentUser.Id && !currentUser.IsAdmin)
        {
            // only the creator or admin can download the file
            return NotFound("File not found.");
        }

        return ServeStaticFile(file);
    }

    [HttpGet("file/{encryptedFileId}"), AllowAnonymous]
    public async Task<ActionResult> DownloadPublic(string encryptedFileId, long validBefore, string hash, CancellationToken cancellationToken)
    {
        Result<int> decodeResult = urlEncryption.DecodeFileIdPath(encryptedFileId, validBefore, hash);
        if (decodeResult.IsFailure)
        {
            return BadRequest(decodeResult.Error);
        }

        int fileId = decodeResult.Value;
        DB.File? file = await db.Files
            .Include(x => x.FileService)
            .Include(x => x.FileContentType)
            .FirstOrDefaultAsync(x => x.Id == fileId, cancellationToken);
        if (file == null)
        {
            return NotFound("File not found.");
        }

        return ServeStaticFile(file);
    }

    internal ActionResult ServeStaticFile(DB.File file)
    {
        DBFileServiceType fileServiceType = (DBFileServiceType)file.FileService.FileServiceTypeId;
        IFileService fs = fileServiceFactory.Create(fileServiceType, file.FileService.Configs);
        if (fileServiceType == DBFileServiceType.Local)
        {
            FileInfo fileInfo = new(Path.Combine(file.FileService.Configs, file.StorageKey));
            if (!fileInfo.Exists)
            {
                return NotFound("File not found.");
            }

            DateTimeOffset lastModified = fileInfo.LastWriteTimeUtc;
            EntityTagHeaderValue etag = new('"' + lastModified.Ticks.ToString("x") + '"', isWeak: true);
            return PhysicalFile(fileInfo.FullName, file.FileContentType.ContentType, lastModified, etag, enableRangeProcessing: true);
        }
        else
        {
            Uri downloadUrl = fs.CreateDownloadUrl(CreateDownloadUrlRequest.FromFile(file));
            return Redirect(downloadUrl.ToString());
        }
    }
}