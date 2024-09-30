using Chats.BE.Controllers.Chats.Conversations;
using Chats.BE.Controllers.Chats.OpenAICompatible.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.OpenAIApiKeySession;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;
using Sdcb.DashScope;
using System.ClientModel;
using System.ClientModel.Primitives;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Chats.BE.DB.Enums;
using System.Diagnostics;
using System.Text;

namespace Chats.BE.Controllers.Chats.OpenAICompatible;

[Route("api/openai-compatible"), Authorize(AuthenticationSchemes = "OpenAIApiKey")]
public partial class OpenAICompatibleController(ChatsDB db, CurrentApiKey apiKey, ConversationFactory cf, UserModelManager userModelManager, ILogger<OpenAICompatibleController> logger, BalanceService balanceService) : ControllerBase
{
    [HttpPost("chat/completions")]
    public async Task<ActionResult> ChatCompletion([FromBody] JsonElement json, CancellationToken cancellationToken)
    {
        bool streamed = json.TryGetProperty("stream", out JsonElement streamProp) && streamProp.GetBoolean();
        bool includeUsage = json.TryGetProperty("stream_options", out JsonElement streamOptionsProp) &&
                           streamOptionsProp.TryGetProperty("include_usage", out JsonElement includeUsageProp) &&
                           includeUsageProp.GetBoolean();
        string? modelName = json.TryGetProperty("model", out JsonElement modelProp) ? modelProp.GetString() : null;
        if (modelName == null) return ModelNotExists(modelName);

        ChatModel[] validModels = await userModelManager.GetValidModelsByApiKey(apiKey.ApiKey, cancellationToken);
        ChatModel? cm = validModels.FirstOrDefault(x => x.Id.ToString() == modelName || x.Name == modelName);
        if (cm == null) return ModelNotExists(modelName);

        ChatMessage[] messages = (json.TryGetProperty("messages", out JsonElement messagesProp) ? messagesProp.EnumerateArray() : [])
            .Select(x =>
            {
                return ChatMessageHelper.DeserializeChatMessage(x, ModelReaderWriterOptions.Json);
            })
            .ToArray();

        using ConversationService s = cf.CreateConversationService(
            Enum.Parse<KnownModelProvider>(cm.ModelKeys.Type),
            cm.ModelKeys.Configs,
            cm.ModelConfig,
            cm.ModelVersion);

        UserModelBalanceCost cost = null!;
        var miscInfo = await db.Users
            .Where(x => x.Id == apiKey.User.Id)
            .Select(x => new
            {
                UserModels = x.UserModel!,
                UserBalance = x.UserBalance!,
            })
            .SingleAsync(cancellationToken);
        List<JsonTokenBalance> tokenBalances = JsonSerializer.Deserialize<List<JsonTokenBalance>>(miscInfo.UserModels.Models)!;
        int tokenBalanceIndex = tokenBalances.FindIndex(x => x.ModelId == cm.Id);
        JsonTokenBalance? tokenBalance = tokenBalances[tokenBalanceIndex];
        ConversationSegment lastSegment = new() { TextSegment = "", InputTokenCount = 0, OutputTokenCount = 0 };
        Stopwatch sw = Stopwatch.StartNew();
        StringBuilder nonStreamingResult = new();
        BadRequestObjectResult? errorToReturn = null;
        try
        {
            JsonPriceConfig priceConfig = JsonSerializer.Deserialize<JsonPriceConfig>(cm.PriceConfig)!;
            if (tokenBalance == null)
            {
                return ErrorMessage(OpenAICompatibleErrorCode.InvalidModel, "The Model does not exist or access is denied.");
            }
            if (!tokenBalance.Enabled)
            {
                return ErrorMessage(OpenAICompatibleErrorCode.InvalidModel, "The Model does not exist or access is denied.");
            }
            if (tokenBalance.Expires != "-" && DateTime.Parse(tokenBalance.Expires) < DateTime.UtcNow)
            {
                return ErrorMessage(OpenAICompatibleErrorCode.SubscriptionExpired, "Subscription has expired");
            }
            if (tokenBalance.Counts == "0" && tokenBalance.Tokens == "0" && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
            {
                return ErrorMessage(OpenAICompatibleErrorCode.InsufficientBalance, "Insufficient balance");
            }
            UserModelBalanceCalculator calculator = new(tokenBalance, miscInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);
            if (!cost.IsSufficient)
            {
                throw new InsufficientBalanceException();
            }

            await foreach (ConversationSegment seg in s.ChatStreamed(messages, new JsonUserModelConfig()
            {
                Temperature = json.TryGetProperty("temperature", out JsonElement tempProp) ? (float)tempProp.GetDouble() : null, 
                EnableSearch = json.TryGetProperty("enable_search", out JsonElement enableSearchProp) && enableSearchProp.GetBoolean(),
                MaxLength = json.TryGetProperty("max_tokens", out JsonElement maxTokensProp) ? maxTokensProp.GetInt32() : null,
            }, apiKey.User, cancellationToken))
            {
                lastSegment = seg;
                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.InputTokenCount, seg.OutputTokenCount, priceConfig);
                if (!currentCost.IsSufficient)
                {
                    throw new InsufficientBalanceException();
                }
                cost = currentCost;
                if (seg.TextSegment == string.Empty) continue;

                if (streamed)
                {
                    ChatCompletionChunk chunk = new()
                    {
                        Id = HttpContext.TraceIdentifier,
                        Object = "chat.completion.chunk",
                        Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        Model = modelName,
                        Choices =
                        [
                            new DeltaChoice
                            {
                                Delta = new Delta { Content = seg.TextSegment },
                                FinishReason = null,
                                Index = 0,
                                Logprobs = null,
                            }
                        ],
                        SystemFingerprint = null,
                        Usage = new Usage
                        {
                            CompletionTokens = seg.OutputTokenCount,
                            PromptTokens = seg.InputTokenCount,
                            TotalTokens = seg.InputTokenCount + seg.OutputTokenCount,
                        }
                    };
                    await YieldResponse(chunk, cancellationToken);
                }
                else
                {
                    nonStreamingResult.Append(seg.TextSegment);
                }

                if (cancellationToken.IsCancellationRequested)
                {
                    break;
                }
            }
        }
        catch (InsufficientBalanceException)
        {
            errorToReturn = await YieldError(streamed, OpenAICompatibleErrorCode.InsufficientBalance, "⚠Insufficient balance - 余额不足!", cancellationToken);
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            logger.LogError(e, "Upstream error");
            errorToReturn = await YieldError(streamed, OpenAICompatibleErrorCode.UpstreamError, e.Message, cancellationToken);
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
        }
        catch (Exception e)
        {
            logger.LogError(e, "Unknown error");
            errorToReturn = await YieldError(streamed, OpenAICompatibleErrorCode.Unknown, "\n⚠Error in conversation - 对话出错!", cancellationToken);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
            sw.Stop();
        }

        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            tokenBalances[tokenBalanceIndex] = tokenBalance;
            miscInfo.UserModels.Models = JsonSerializer.Serialize(tokenBalances);
        }
        TransactionLog transactionLog = new()
        {
            UserId = apiKey.User.Id,
            CreatedAt = DateTime.UtcNow,
            CreditUserId = apiKey.User.Id,
            Amount = -cost.CostBalance,
            TransactionTypeId = (byte)DBTransactionType.ApiCost,
        };
        ApiUsage usage = new()
        {
            ChatModelId = cm.Id,
            CreatedAt = DateTime.UtcNow,
            ApiKeyId = apiKey.ApiKeyId,
            DurationMs = (int)sw.ElapsedMilliseconds,
            InputCost = cost.InputTokenPrice,
            InputTokenCount = lastSegment.InputTokenCount,
            OutputCost = cost.OutputTokenPrice,
            OutputTokenCount = lastSegment.OutputTokenCount,
            TransactionLog = transactionLog,
        };
        db.ApiUsages.Add(usage);
        await db.SaveChangesAsync(cancellationToken);
        if (cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(apiKey.User.Id);
        }

        if (streamed)
        {
            return new EmptyResult();
        }
        else
        {
            if (errorToReturn != null)
            {
                return errorToReturn;
            }

            // success
            return Ok(new FullChatCompletion()
            {
                Id = ControllerContext.HttpContext.TraceIdentifier,
                Choices =
                [
                    new MessageChoice
                    {
                        Index = 0,
                        FinishReason = "stop",
                        Logprobs = null,
                        Message = new ResponseMessage
                        {
                            Role = "system",
                            Content = nonStreamingResult.ToString(),
                            Refusal = null,
                        }
                    }
                ],
                Object = "chat.completion",
                Created = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                Model = modelName,
                SystemFingerprint = null,
                Usage = new Usage
                {
                    CompletionTokens = lastSegment.OutputTokenCount,
                    PromptTokens = lastSegment.InputTokenCount,
                    TotalTokens = lastSegment.InputTokenCount + lastSegment.OutputTokenCount,
                }
            });
        }
    }

    private readonly static ReadOnlyMemory<byte> dataU8 = "data: "u8.ToArray();
    private readonly static ReadOnlyMemory<byte> lflfU8 = "\n\n"u8.ToArray();

    private BadRequestObjectResult ErrorMessage(OpenAICompatibleErrorCode code, string message)
    {
        return BadRequest(new ErrorResponse()
        {
            Error = new ErrorDetail
            {
                Code = code.ToString(),
                Message = message,
                Param = null,
                Type = ""
            }
        });
    }

    private async Task<BadRequestObjectResult> YieldError(bool streamed, OpenAICompatibleErrorCode code, string message, CancellationToken cancellationToken)
    {
        if (streamed)
        {
            await Response.Body.WriteAsync(dataU8, cancellationToken);
            await JsonSerializer.SerializeAsync(Response.Body, new ErrorResponse()
            {
                Error = new ErrorDetail
                {
                    Code = code.ToString(),
                    Message = message,
                    Param = null,
                    Type = ""
                }
            }, JSON.JsonSerializerOptions, cancellationToken);
            await Response.Body.WriteAsync(lflfU8, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
        
        return ErrorMessage(code, message);
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
        return ErrorMessage(OpenAICompatibleErrorCode.InvalidModel, $"The model `{modelName}` does not exist or you do not have access to it.");
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
