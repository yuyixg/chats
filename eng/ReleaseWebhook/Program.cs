using Amazon.S3;
using Microsoft.Extensions.Options;
using Octokit;
using ProductHeaderValue = Octokit.ProductHeaderValue;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// 1. 从配置文件中绑定我们的配置节
builder.Services.Configure<GitHubSettings>(builder.Configuration.GetSection("GitHub"));
builder.Services.Configure<MinioSettings>(builder.Configuration.GetSection("Minio"));

// 2. 添加 MVC Controller 支持
builder.Services.AddControllers();

// 3. 注册 Octokit GitHubClient（使用配置的Token）
builder.Services.AddSingleton(provider =>
{
    GitHubSettings gh = provider.GetRequiredService<IOptions<GitHubSettings>>().Value;
    GitHubClient client = new(new ProductHeaderValue("Sdcb-Chats-Sync"))
    {
        Credentials = new Credentials(gh.Token)
    };
    return client;
});

// 4. 注册 AWS S3 / MinIO Client
builder.Services.AddSingleton(provider =>
{
    MinioSettings minio = provider.GetRequiredService<IOptions<MinioSettings>>().Value;
    AmazonS3Config s3Config = new()
    {
        ServiceURL = minio.Endpoint,
        ForcePathStyle = true, // MinIO 通常需要使用 PathStyle
        RequestChecksumCalculation = Amazon.Runtime.RequestChecksumCalculation.WHEN_REQUIRED,
    };
    return (IAmazonS3)new AmazonS3Client(minio.AccessKey, minio.SecretKey, s3Config);
});

// 5. 注册 HttpClient 工厂
builder.Services.AddHttpClient();

WebApplication app = builder.Build();

// 使用路由与授权中间件（注意，根据需要添加 HTTPS、静态文件、中间件等）
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();