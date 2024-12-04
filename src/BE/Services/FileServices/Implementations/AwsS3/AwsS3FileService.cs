using Amazon;
using Amazon.S3;
using Amazon.S3.Model;

namespace Chats.BE.Services.FileServices.Implementations.AwsS3;

public class AwsS3FileService : IFileService
{
    private readonly IHaveBucket _config;
    private readonly AmazonS3Client _s3;

    public AwsS3FileService(AwsS3Config config)
    {
        _config = config;
        if (config.AccessKeyId == null)
        {
            // auto load from default environment profile
            _s3 = new();
        }
        else
        {
            _s3 = new(config.AccessKeyId, config.SecretAccessKey, new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.GetBySystemName(config.Region)
            });
        }
    }

    public AwsS3FileService(IHaveBucket config, AmazonS3Client s3)
    {
        _config = config;
        _s3 = s3;
    }

    public Uri CreateDownloadUrl(CreateDownloadUrlRequest req)
    {
        string url = _s3.GetPreSignedURL(new GetPreSignedUrlRequest
        {
            BucketName = _config.Bucket,
            Key = req.StorageKey,
            Expires = DateTime.UtcNow + req.ValidPeriod,
            Verb = HttpVerb.GET
        });
        return new Uri(url);
    }

    public async Task<Stream> Download(string storageKey, CancellationToken cancellationToken)
    {
        GetObjectResponse resp = await _s3.GetObjectAsync(new GetObjectRequest
        {
            BucketName = _config.Bucket,
            Key = storageKey
        }, cancellationToken);
        return resp.ResponseStream;
    }

    public async Task<string> Upload(FileUploadRequest request, CancellationToken cancellationToken)
    {
        SuggestedStorageInfo ssi = SuggestedStorageInfo.FromFileName(request.FileName);
        _ = await _s3.PutObjectAsync(new PutObjectRequest()
        {
            BucketName = _config.Bucket,
            Key = ssi.StorageKey,
            InputStream = request.Stream,
            ContentType = request.ContentType
        }, cancellationToken);
        return ssi.StorageKey;
    }
}
