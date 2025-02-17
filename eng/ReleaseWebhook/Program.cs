using Amazon.S3;
using Microsoft.Extensions.Options;
using Octokit;
using ProductHeaderValue = Octokit.ProductHeaderValue;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<GitHubSettings>(builder.Configuration.GetSection("GitHub"));
builder.Services.Configure<MinioSettings>(builder.Configuration.GetSection("Minio"));

builder.Services.AddControllers();

builder.Services.AddSingleton(provider =>
{
    GitHubSettings gh = provider.GetRequiredService<IOptions<GitHubSettings>>().Value;
    GitHubClient client = new(new ProductHeaderValue("Sdcb-Chats-Sync"))
    {
        Credentials = new Credentials(gh.Token)
    };
    return client;
});

builder.Services.AddSingleton(provider =>
{
    MinioSettings minio = provider.GetRequiredService<IOptions<MinioSettings>>().Value;
    AmazonS3Config s3Config = new()
    {
        ServiceURL = minio.Endpoint,
        ForcePathStyle = true,
        Timeout = TimeSpan.FromMinutes(30),
    };
    return (IAmazonS3)new AmazonS3Client(minio.AccessKey, minio.SecretKey, s3Config);
});

builder.Services.AddHttpClient();

WebApplication app = builder.Build();

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();