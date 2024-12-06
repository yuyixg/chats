using Chats.BE.DB.Enums;
using Chats.BE.Services.FileServices.Implementations.AliyunOSS;
using Chats.BE.Services.FileServices.Implementations.AwsS3;
using Chats.BE.Services.FileServices.Implementations.AzureBlobStorage;
using Chats.BE.Services.FileServices.Implementations.Local;
using Chats.BE.Services.FileServices.Implementations.Minio;
using Chats.BE.Services.UrlEncryption;
using System.Collections.Concurrent;
using System.Text.Json;

namespace Chats.BE.Services.FileServices;

public class FileServiceFactory(HostUrlService hostUrlService, IUrlEncryptionService urlEncryption)
{
    private readonly ConcurrentDictionary<CacheKey, IFileService> _cache = [];

    public IFileService Create(DBFileServiceType fileServiceType, string config)
    {
        CacheKey key = new(fileServiceType, config);
        if (_cache.TryGetValue(key, out IFileService? fileService))
        {
            return fileService;
        }
        fileService = CreateNoCache(fileServiceType, config);
        _cache[key] = fileService;
        return fileService;
    }

    private IFileService CreateNoCache(DBFileServiceType fileServiceType, string config)
    {
        return fileServiceType switch
        {
            DBFileServiceType.Local => new LocalFileService(config, hostUrlService, urlEncryption),
            DBFileServiceType.Minio => new MinioFileService(JsonSerializer.Deserialize<MinioConfig>(config)!),
            DBFileServiceType.AwsS3 => new AwsS3FileService(JsonSerializer.Deserialize<AwsS3Config>(config)!),
            DBFileServiceType.AliyunOSS => new AliyunOSSFileService(JsonSerializer.Deserialize<AliyunOssConfig>(config)!),
            DBFileServiceType.AzureBlobStorage => new AzureBlobStorageFileService(JsonSerializer.Deserialize<AzureBlobStorageConfig>(config)!),
            _ => throw new ArgumentException($"Unsupported file service type: {fileServiceType}")
        };
    }

    private record CacheKey(DBFileServiceType FileServiceType, string Config);
}
