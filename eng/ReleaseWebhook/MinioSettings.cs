
/// <summary>
/// Minio(S3)相关配置
/// </summary>
public record MinioSettings
{
    public required string Endpoint { get; set; }
    public required string AccessKey { get; set; }
    public required string SecretKey { get; set; }
    public required string BucketName { get; set; }
}