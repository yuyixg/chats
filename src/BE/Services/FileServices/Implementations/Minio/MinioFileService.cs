using Amazon;
using Amazon.S3;
using Chats.BE.Services.FileServices.Implementations.AwsS3;

namespace Chats.BE.Services.FileServices.Implementations.Minio;

public class MinioFileService(MinioConfig config) : AwsS3FileService(config, CreateS3(config))
{
    private static AmazonS3Client CreateS3(MinioConfig config)
    {
        AmazonS3Config s3Config = new()
        {
            ForcePathStyle = true,
            ServiceURL = config.Endpoint,
        };
        if (config.Region != null)
        {
            s3Config.RegionEndpoint = RegionEndpoint.GetBySystemName(config.Region);
        }
        AmazonS3Client s3 = new(config.AccessKey, config.SecretKey, s3Config);
        return s3;
    }
}
