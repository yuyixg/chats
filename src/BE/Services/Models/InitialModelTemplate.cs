using Chats.BE.DB;
using System.Text.Json.Serialization;

namespace Chats.BE.Services.Models;

public record InitialModelTemplate
{
    [JsonPropertyName("provider")]
    public required string Provider { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; }

    [JsonPropertyName("config")]
    public required Config Config { get; init; }

    [JsonPropertyName("modelConfig")]
    public required ModelInitConfig InitialModelConfig { get; init; }

    [JsonPropertyName("apiConfig")]
    public required Dictionary<string, string> InitialApiConfig { get; init; }

    [JsonPropertyName("fileConfig")]
    public required FileConfig FileConfig { get; init; }

    [JsonPropertyName("priceConfig")]
    public required PriceConfig PriceConfig { get; init; }
}

public record PriceConfig
{
    [JsonPropertyName("input")]
    public required decimal Input { get; init; }

    [JsonPropertyName("out")]
    public required decimal Out { get; init; }
}

public record FileConfig
{
    [JsonPropertyName("count")]
    public required int Count { get; init; }

    [JsonPropertyName("maxSize")]
    public required int MaxSize { get; init; }
}

public record ModelInitConfig
{
    [JsonPropertyName("prompt")]
    public required string Prompt { get; init; }

    [JsonPropertyName("temperature")]
    public required decimal Temperature { get; init; }

    [JsonPropertyName("organization")]
    public string? Organization { get; init; }

    [JsonPropertyName("model")]
    public string? Model { get; init; }

    // Azure specific properties
    [JsonPropertyName("version")]
    public string? Version { get; init; }

    [JsonPropertyName("deploymentName")]
    public string? DeploymentName { get; init; }

    // QianWen specific properties
    [JsonPropertyName("enableSearch")]
    public bool? EnableSearch { get; init; }
}