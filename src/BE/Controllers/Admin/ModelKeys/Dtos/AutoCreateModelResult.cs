using Chats.BE.DB;
using Chats.BE.Services.Conversations;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Admin.ModelKeys.Dtos;

public record AutoCreateModelResult
{
    [JsonPropertyName("modelName")]
    public required string ModelName { get; init; }

    [JsonPropertyName("isCreated")]
    public required bool IsCreated { get; init; }

    [JsonPropertyName("error")]
    public required string? Error { get; init; }
}

public record ParepareAutoCreateModelResult
{
    public required ModelReference ModelReference { get; init; }

    public bool IsValidationPassed => !IsAlreadyExists && !IsApiError && Error == null;

    public bool IsAlreadyExists { get; init; } = false;

    public bool IsApiError { get; init; } = false;

    public required string? Error { get; init; }

    public static ParepareAutoCreateModelResult ModelAlreadyExists(ModelReference modelReference)
    {
        return new ParepareAutoCreateModelResult
        {
            ModelReference = modelReference,
            IsAlreadyExists = true,
            Error = "Model already exists.",
        };
    }

    public static ParepareAutoCreateModelResult FromModelValidateResult(ModelValidateResult result, ModelReference modelReference)
    {
        return new ParepareAutoCreateModelResult
        {
            ModelReference = modelReference,
            IsApiError = !result.IsSuccess,
            Error = result.ErrorMessage
        };
    }

    public AutoCreateModelResult ToResult(string? dbSaveError)
    {
        return new AutoCreateModelResult
        {
            ModelName = ModelReference.Name,
            IsCreated = IsValidationPassed && dbSaveError == null,
            Error = Error ?? dbSaveError
        };
    }
}