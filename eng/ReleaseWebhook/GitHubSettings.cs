
/// <summary>
/// GitHub相关配置项
/// </summary>
public record GitHubSettings
{
    public required string Owner { get; init; }
    public required string Repo { get; init; }
    public required string Token { get; init; }
}
