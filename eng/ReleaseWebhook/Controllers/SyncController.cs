using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Octokit;
using System.Net.Http.Headers;

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

    /// <summary>
    /// 接收 POST https://yourdomain/sync/{runId} 的请求，同步该 run 的 artifacts 到 MinIO，
    /// 然后将“r{runNumber}”目录作为最新版本同步到 latest 目录。
    /// </summary>
    /// <param name="runId">GitHub Actions的 run id</param>
    /// <returns></returns>
    [HttpPost("{runId:long}")]
    public async Task<IActionResult> SyncArtifacts(long runId, bool isRelease)
    {
        GitHubSettings ghSettings = ghOptions.Value;
        MinioSettings minio = minioOptions.Value;

        if (string.IsNullOrWhiteSpace(ghSettings.Owner) || string.IsNullOrWhiteSpace(ghSettings.Repo))
        {
            return BadRequest("GitHub Owner 或 Repo 未配置！");
        }

        // 1. 通过 Octokit 获取 Workflow Run 信息，取 run_number
        WorkflowRun run;
        try
        {
            run = await ghClient.Actions.Workflows.Runs.Get(ghSettings.Owner, ghSettings.Repo, runId);
        }
        catch (NotFoundException)
        {
            return NotFound($"Run {runId} 未找到");
        }
        long runNumber = run.RunNumber;
        Console.WriteLine($"[{DateTime.Now}] GET RunId={runId} => RunNumber={runNumber}");

        // 2. 获取该 Run 下的所有 artifacts
        ListArtifactsResponse artifactsResp = await ghClient.Actions.Artifacts.ListWorkflowArtifacts(ghSettings.Owner, ghSettings.Repo, runId);
        if (artifactsResp.Artifacts.Count == 0)
        {
            Console.WriteLine($"Run {runId} 无 Artifact");
        }

        // 3. 使用 HttpClient 下载 artifact ZIP 文件（注意：这里下载需要附带 GitHub Token）
        HttpClient httpClient = httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Sdcb-Chats-Sync/1.0");
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ghSettings.Token);

        foreach (Artifact artifact in artifactsResp.Artifacts)
        {
            Console.WriteLine($"处理 Artifact: {artifact.Name}, ID={artifact.Id}");

            // 获取 Artifact archive 下载地址
            HttpResponseMessage response = await httpClient.GetAsync(artifact.ArchiveDownloadUrl);
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"下载失败: {artifact.Name}, HTTP: {(int)response.StatusCode}");
                continue;
            }

            using Stream zipStream = await response.Content.ReadAsStreamAsync();

            // 上传到 MinIO 文件夹：存放在 "r{runNumber}/{artifactName}.zip"
            string s3Key = $"r{runNumber}/{artifact.Name}.zip";
            PutObjectRequest putRequest = new()
            {
                BucketName = minio.BucketName,
                Key = s3Key,
                InputStream = zipStream
            };
            await s3Client.PutObjectAsync(putRequest);
            Console.WriteLine($"Artifact {artifact.Name} 上传成功 (key: {s3Key})");
        }

        if (isRelease)
        {
            await SyncLatest(s3Client, minio, runNumber);
        }

        Console.WriteLine($"Run {runId} (RunNumber={runNumber}) 同步完成");
        return Ok($"Run {runId} -> r{runNumber} 同步完成");
    }

    private static async Task SyncLatest(IAmazonS3 s3Client, MinioSettings minio, long runNumber)
    {
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
            Console.WriteLine($"已删除 latest 下的对象: {s3Obj.Key}");
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
            Console.WriteLine($"Copied {s3Obj.Key} => {destKey}");
        }
    }
}