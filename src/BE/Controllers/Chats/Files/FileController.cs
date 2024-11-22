using Amazon.S3;
using Amazon.S3.Model;
using Chats.BE.Controllers.Chats.Files.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Chats.Files;

[Route("api/files")]
public class FileController(ChatsDB db) : ControllerBase
{
    [Route("{fileServiceId:int}"), HttpPost]
    public async Task<ActionResult<FileUrlsDto>> GetFileUrls(
        int fileServiceId, 
        [FromBody] GetFileUrlsRequest fileInfo, 
        CancellationToken cancellationToken)
    {
        FileService? fileService = await db.FileServices
            .FindAsync([fileServiceId], cancellationToken);
        if (fileService == null || !fileService.Enabled)
        {
            return NotFound("File server config not found.");
        }

        if (fileService.Type != FileServiceTypes.Minio.ToString())
        {
            return this.BadRequestMessage("Unsupported file service type: " + fileService.Type);
        }

        JsonMinioConfig config = JsonMinioConfig.Parse(fileService.Configs);
        using AmazonS3Client s3 = new(config.AccessKey, config.AccessSecret, new AmazonS3Config
        {
            ForcePathStyle = true, 
            ServiceURL = config.Endpoint
        });

        string key = $"{DateTime.Now:yyyy/MM/dd}/{fileInfo}";
        string putUrl = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            BucketName = config.BucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddMinutes(5),
            Verb = HttpVerb.PUT
        });
        string getUrl = await s3.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            BucketName = config.BucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddDays(7),
            Verb = HttpVerb.GET
        });

        return Ok(new FileUrlsDto
        { 
            GetUrl = getUrl,
            PutUrl = putUrl,
        });
    }
}
