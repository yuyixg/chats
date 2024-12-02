using Chats.BE.DB.Enums;
using Chats.BE.Services.FileServices.Implementations.AliyunOSS;
using Chats.BE.Services.FileServices.Implementations.AwsS3;
using Chats.BE.Services.FileServices.Implementations.AzureBlobStorage;
using Chats.BE.Services.FileServices.Implementations.Local;
using Chats.BE.Services.FileServices.Implementations.Minio;
using System.Text.Json;

namespace Chats.BE.Services.FileServices;

public class FileServiceFactory(HostUrlService hostUrlService)
{
    public IFileService Create(DBFileServiceType fileServiceType, string config)
    {
        return fileServiceType switch
        {
            DBFileServiceType.Local => new LocalFileService(config, hostUrlService),
            DBFileServiceType.Minio => new MinioFileService(JsonSerializer.Deserialize<MinioConfig>(config)!),
            DBFileServiceType.AwsS3 => new AwsS3FileService(JsonSerializer.Deserialize<AwsS3Config>(config)!),
            DBFileServiceType.AliyunOSS => new AliyunOSSFileService(JsonSerializer.Deserialize<AliyunOssConfig>(config)!),
            DBFileServiceType.AzureBlobStorage => new AzureBlobStorageFileService(config),
            _ => throw new ArgumentException($"Unsupported file service type: {fileServiceType}")
        };
    }
}
