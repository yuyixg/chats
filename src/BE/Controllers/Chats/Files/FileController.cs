using Amazon.S3;
using Amazon.S3.Model;
using Chats.BE.Controllers.Chats.Files.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Files;

[Route("api/files")]
public class FileController(ChatsDB db) : ControllerBase
{
    [Route("minio"), HttpPost]
    public async Task<ActionResult<MinioAddressResponse>> GetMinioAddress(
        [FromQuery] Guid id, 
        [FromBody] GetMinioAddressRequest fileInfo, 
        CancellationToken cancellationToken)
    {
        string? minioConfigText = await db.FileServices
            .Where(x => x.Id == id && x.Type == FileServiceTypes.Minio.ToString())
            .Select(x => x.Configs)
            .SingleOrDefaultAsync(cancellationToken);
        if (minioConfigText == null)
        {
            return NotFound("File server config not found.");
        }

        JsonMinioConfig config = JsonMinioConfig.Parse(minioConfigText);
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

        return Ok(new MinioAddressResponse
        { 
            GetUrl = getUrl,
            PutUrl = putUrl,
        });
    }
}
