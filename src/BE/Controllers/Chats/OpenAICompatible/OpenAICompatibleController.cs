using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Controllers.Chats.OpenAICompatible.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.OpenAIApiKeySession;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using System.ClientModel.Primitives;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Chats.BE.Controllers.Chats.OpenAICompatible;

[Route("api/openai-compatible"), Authorize(AuthenticationSchemes = "OpenAIApiKey")]
public class OpenAICompatibleController(ChatsDB db, CurrentApiKey apiKey, ConversationFactory cf, UserModelManager userModelManager) : ControllerBase
{
    [HttpPost("chat/completions")]
    public async Task<ActionResult> ChatCompletion([FromBody] JsonObject json, CancellationToken cancellationToken)
    {
        bool streamed = json["stream"]?.GetValue<bool>() ?? false;
        if (!streamed) return ErrorMessage("Only streamed completions are supported.");

        bool includeUsage = json["stream_options"]?["include_usage"]?.GetValue<bool>() ?? false;

        string? modelName = json["model"]?.ToString();
        if (modelName == null) return ModelNotExists(modelName);

        ChatModel[] validModels = await userModelManager.GetValidModelsByApiKey(apiKey.ApiKey, cancellationToken);
        ChatModel? cm = validModels.FirstOrDefault(x => x.Id.ToString() == modelName || x.Name == modelName);
        if (cm == null) return ModelNotExists(modelName);

        ChatMessage[] messages = (json["messages"]?.AsArray() ?? []).Select(x =>
            {
                StubChatMessage temp = new();
                return ((IJsonModel<ChatMessage>)temp).Create(new BinaryData(x), ModelReaderWriterOptions.Json);
            })
            .ToArray();

        using ConversationService s = cf.CreateConversationService(
            Enum.Parse<KnownModelProvider>(cm.ModelKeys.Type),
            cm.ModelKeys.Configs,
            cm.ModelConfig,
            cm.ModelVersion);

        Guid id = Guid.NewGuid();
        await foreach (ConversationSegment seg in s.ChatStreamed(messages, new JsonUserModelConfig()
        {
            Temperature = json["temperature"]?.GetValue<float>(),
            EnableSearch = json["enable_search"]?.GetValue<bool>(),
            MaxLength = json["max_length"]?.GetValue<int>(), 
        }, apiKey.User, cancellationToken))
        {
            ChatCompletionChunk chunk = new()
            {
                Id = id.ToString(),
                Object = "chat.completion.chunk", 
                Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                Model = modelName,
                Choices =
                [
                    new Choice
                    {
                        Delta = new Delta { Content = seg.TextSegment },
                        FinishReason = null,
                        Index = 0,
                        Logprobs = null,
                    }
                ],
                SystemFingerprint = "v1",
                Usage = new Usage
                {
                    CompletionTokens = seg.OutputTokenCount,
                    PromptTokens = seg.InputTokenCount,
                    TotalTokens = seg.InputTokenCount + seg.OutputTokenCount,
                }
            };
            await YieldResponse(chunk, cancellationToken);
        }
        return new EmptyResult();
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data: "u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lflfU8 = "\n\n"u8.ToArray();

    private BadRequestObjectResult ErrorMessage(string message)
    {
        return BadRequest(new ErrorResponse()
        {
            Error = new ErrorDetail
            {
                Code = "", Message = message, Param = "", Type = ""
            }
        });
    }

    private async Task YieldResponse(ChatCompletionChunk chunk, CancellationToken cancellationToken)
    {
        await Response.Body.WriteAsync(dataU8, cancellationToken);
        await JsonSerializer.SerializeAsync(Response.Body, chunk, JSON.JsonSerializerOptions, cancellationToken);
        await Response.Body.WriteAsync(lflfU8, cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private BadRequestObjectResult ModelNotExists(string? modelName)
    {
        return ErrorMessage($"The model `{modelName}` does not exist or you do not have access to it.");
    }

    private class StubChatMessage : ChatMessage
    {
        protected override void WriteCore(Utf8JsonWriter writer, ModelReaderWriterOptions options)
        {
            throw new NotImplementedException();
        }
    }

    [HttpGet("models")]
    public async Task<ActionResult<ModelListDto>> GetModels(CancellationToken cancellationToken)
    {
        ChatModel[] models = await userModelManager.GetValidModelsByApiKey(apiKey.ApiKey, cancellationToken);
        return Ok(new ModelListDto
        {
            Object = "list",
            Data = models.Select(x => new ModelListItemDto
            {
                Id = x.Name,
                Created = new DateTimeOffset(x.CreatedAt, TimeSpan.Zero).ToUnixTimeSeconds(),
                Object = "model",
                OwnedBy = x.ModelKeys.Type
            }).ToArray()
        });
    }
}
