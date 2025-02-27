﻿using Chats.BE.DB.Jsons;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.AdminModels.Dtos;

public record UpdateUserModelRequest
{
    [JsonPropertyName("userId")]
    public required int UserId { get; init; }

    [JsonPropertyName("models")]
    public required UserModelUpdateDto[] Models { get; init; }
}

public record UserModelUpdateDto : JsonTokenBalance
{
    [JsonPropertyName("id")]
    public required int Id { get; init; }
}

public record UserModelDto : UserModelUpdateDto
{
    [JsonPropertyName("displayName")]
    public required string DisplayName { get; init; }

    [JsonPropertyName("modelKeyName")]
    public required string ModelKeyName { get; init; }
}