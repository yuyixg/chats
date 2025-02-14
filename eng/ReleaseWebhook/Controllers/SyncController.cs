using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Octokit;
using System.Net.Http.Headers;
using System.Text;

namespace ReleaseWebhook.Controllers;

[ApiController]
[Route("sync")]
public class SyncController(
    IOptions<GitHubSettings> ghOptions,
    IOptions<MinioSettings> minioOptions,
    GitHubClient ghClient,
    IAmazonS3 s3Client,
    IHttpClientFactory httpClientFactory) : ControllerBase
{
    async Task ResponseLine(string line)
    {
        await Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(line));
        await Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes(Environment.NewLine));
        await Response.BodyWriter.FlushAsync();
    }

    async Task PrepareResponse()
    {
        Response.StatusCode = 200;
        Response.ContentType = "text/plain; charset=utf-8";
        await Response.BodyWriter.WriteAsync(Encoding.UTF8.GetBytes("开始同步...\n"));
        await Response.BodyWriter.FlushAsync();
    }

    [HttpPost("{runId:long}/{artifactName}")]
    [HttpGet("{runId:long}/{artifactName}")]
    public async Task SyncOne(long runId, string artifactName)
    {
        await PrepareResponse();
        GitHubSettings ghSettings = ghOptions.Value;
        MinioSettings minio = minioOptions.Value;

        if (string.IsNullOrWhiteSpace(ghSettings.Owner) || string.IsNullOrWhiteSpace(ghSettings.Repo))
        {
            await ResponseLine("GitHub Owner 或 Repo 未配置！");
            return;
        }

        // 1. 通过 Octokit 获取 Workflow Run 信息，取 run_number
        WorkflowRun run;
        try
        {
            run = await ghClient.Actions.Workflows.Runs.Get(ghSettings.Owner, ghSettings.Repo, runId);
        }
        catch (NotFoundException)
        {
            await ResponseLine($"Run {runId} 不存在");
            return;
        }

        long runNumber = run.RunNumber;
        await ResponseLine($"Run {runId} 的 Run Number: {runNumber}");

        // 2. 获取该 Run 下的所有 artifacts
        ListArtifactsResponse artifactsResp = await ghClient.Actions.Artifacts.ListWorkflowArtifacts(ghSettings.Owner, ghSettings.Repo, runId);
        if (artifactsResp.Artifacts.Count == 0)
        {
            await ResponseLine($"Run {runId} 无 Artifacts");
            return;
        }

        // 3. 使用 HttpClient 下载 artifact ZIP 文件（注意：这里下载需要附带 GitHub Token）
        HttpClient httpClient = httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Sdcb-Chats-Sync/1.0");
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ghSettings.Token);

        Artifact? artifact = artifactsResp.Artifacts.FirstOrDefault(a => a.Name == artifactName);
        if (artifact == null)
        {
            await ResponseLine($"Artifact {artifactName} 不存在");
            return;
        }

        await ResponseLine($"开始下载 Artifact {artifact.Name}...");
        // 获取 Artifact archive 下载地址
        HttpResponseMessage response = await httpClient.GetAsync(artifact.ArchiveDownloadUrl);
        if (!response.IsSuccessStatusCode)
        {
            await ResponseLine($"下载 Artifact {artifact.Name} 失败: {response.StatusCode}");
            return;
        }

        using Stream zipStream = await response.Content.ReadAsStreamAsync();
        await ResponseLine($"已下载 Artifact {artifact.Name}, 大小: {zipStream.Length}");

        // 上传到 MinIO 文件夹：存放在 "r{runNumber}/{artifactName}.zip"
        string s3Key = $"r{runNumber}/{artifact.Name}.zip";
        PutObjectRequest putRequest = new()
        {
            BucketName = minio.BucketName,
            Key = s3Key,
            InputStream = zipStream
        };
        await s3Client.PutObjectAsync(putRequest);
        await ResponseLine($"已上传 Artifact {artifact.Name} => {s3Key}");
    }

    [HttpPost("latest/{runNumber:long}")]
    [HttpGet("latest/{runNumber:long}")]
    public async Task SyncLatest(long runNumber)
    {
        await PrepareResponse();
        GitHubSettings ghSettings = ghOptions.Value;
        MinioSettings minio = minioOptions.Value;

        if (string.IsNullOrWhiteSpace(ghSettings.Owner) || string.IsNullOrWhiteSpace(ghSettings.Repo))
        {
            await ResponseLine("GitHub Owner 或 Repo 未配置！");
            return;
        }

        // 4. 删除 latest 文件夹中的所有对象
        List<KeyVersion> keysToDelete = [];
        ListObjectsV2Request listRequest = new()
        {
            BucketName = minio.BucketName,
            Prefix = "latest/"
        };

        ListObjectsV2Response listResponse = await s3Client.ListObjectsV2Async(listRequest);
        foreach (S3Object s3Obj in listResponse.S3Objects)
        {
            DeleteObjectRequest deleteRequest = new()
            {
                BucketName = minio.BucketName,
                Key = s3Obj.Key
            };
            await s3Client.DeleteObjectAsync(deleteRequest);
            await ResponseLine($"已删除 {s3Obj.Key}");
        }

        // 5. 将 "r{runNumber}" 文件夹内的对象复制到 "latest" 文件夹
        string copySrcPrefix = $"r{runNumber}/";
        ListObjectsV2Request copyListRequest = new()
        {
            BucketName = minio.BucketName,
            Prefix = copySrcPrefix
        };
        ListObjectsV2Response copyListResponse = await s3Client.ListObjectsV2Async(copyListRequest);
        foreach (S3Object s3Obj in copyListResponse.S3Objects)
        {
            string relativeKey = s3Obj.Key[copySrcPrefix.Length..]; // 提取 artifactName.zip
            string destKey = $"latest/{relativeKey}";
            CopyObjectRequest copyRequest = new()
            {
                SourceBucket = minio.BucketName,
                SourceKey = s3Obj.Key,
                DestinationBucket = minio.BucketName,
                DestinationKey = destKey
            };
            await s3Client.CopyObjectAsync(copyRequest);
            await ResponseLine($"已复制 {s3Obj.Key} => {destKey}");
        }
    }
}