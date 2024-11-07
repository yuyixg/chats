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
using Microsoft.EntityFrameworkCore;
using Chats.BE.DB.Enums;
using System.Diagnostics;
using System.Text;
using Chats.BE.Services.Conversations.Extensions;
using Chats.BE.Services.Common;

namespace Chats.BE.Controllers.Chats.OpenAICompatible;

[Route("api/openai-compatible"), Authorize(AuthenticationSchemes = "OpenAIApiKey")]
public partial class OpenAICompatibleController(ChatsDB db, CurrentApiKey currentApiKey, ConversationFactory cf, UserModelManager userModelManager, ILogger<OpenAICompatibleController> logger, BalanceService balanceService) : ControllerBase
{
    [HttpPost("chat/completions")]
    public async Task<ActionResult> ChatCompletion(CancellationToken cancellationToken)
    {
        ChatCompletionOptions cco;
        try
        {
            cco = ModelReaderWriter.Read<ChatCompletionOptions>(await BinaryData.FromStreamAsync(Request.Body, cancellationToken), ModelReaderWriterOptions.Json)!;
        }
        catch (ArgumentException e)
        {
            return ErrorMessage(OpenAICompatibleErrorCode.BadParameter, e.Message);
        }
        
        UserModel2[] validModels = await userModelManager.GetValidModelsByApiKey(currentApiKey.ApiKey, cancellationToken);
        string? modelName = cco.GetModelName().ToString();
        if (string.IsNullOrWhiteSpace(modelName)) return InvalidModel(modelName);

        UserModel2? userModel = validModels.FirstOrDefault(x => x.Model.Name == modelName) ?? validModels.FirstOrDefault(x => x.Model.ModelReference.Name == modelName);
        if (userModel == null) return InvalidModel(modelName);
        Model? cm = userModel.Model;

        using ConversationService s = cf.CreateConversationService(cm);

        UserModelBalanceCost cost = null!;
        var miscInfo = await db.Users
            .Where(x => x.Id == currentApiKey.User.Id)
            .Select(x => new
            {
                UserBalance = x.UserBalance!,
            })
            .SingleAsync(cancellationToken);
        ConversationSegment lastSegment = new() { TextSegment = "", InputTokenCount = 0, OutputTokenCount = 0 };
        Stopwatch sw = Stopwatch.StartNew();
        StringBuilder nonStreamingResult = new();
        BadRequestObjectResult? errorToReturn = null;
        try
        {
            if (userModel.IsDeleted)
            {
                return InvalidModel(modelName);
            }
            if (userModel.ExpiresAt.IsExpired())
            {
                return ErrorMessage(OpenAICompatibleErrorCode.SubscriptionExpired, "Subscription has expired");
            }
            JsonPriceConfig priceConfig = cm.ToPriceConfig();
            if (userModel.TokenBalance == 0 && userModel.CountBalance == 0 && miscInfo.UserBalance.Balance == 0 && !priceConfig.IsFree())
            {
                return ErrorMessage(OpenAICompatibleErrorCode.InsufficientBalance, "Insufficient balance");
            }
            UserModelBalanceCalculator calculator = new(userModel.CountBalance, userModel.TokenBalance, miscInfo.UserBalance.Balance);
            cost = calculator.GetNewBalance(0, 0, priceConfig);
            if (!cost.IsSufficient)
            {
                throw new InsufficientBalanceException();
            }

            await foreach (ConversationSegment seg in s.ChatStreamed([.. cco.GetMessages()], cco, cancellationToken))
            {
                lastSegment = seg;
                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.InputTokenCount, seg.OutputTokenCount, priceConfig);
                if (!currentCost.IsSufficient)
                {
                    throw new InsufficientBalanceException();
                }
                cost = currentCost;
                if (seg.TextSegment == string.Empty) continue;

                if (cco.IsStreamed())
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
            errorToReturn = await YieldError(cco.IsStreamed(), OpenAICompatibleErrorCode.InsufficientBalance, "⚠Insufficient balance - 余额不足!", cancellationToken);
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            logger.LogError(e, "Upstream error");
            errorToReturn = await YieldError(cco.IsStreamed(), OpenAICompatibleErrorCode.UpstreamError, e.Message, cancellationToken);
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
        }
        catch (Exception e)
        {
            logger.LogError(e, "Unknown error");
            errorToReturn = await YieldError(cco.IsStreamed(), OpenAICompatibleErrorCode.Unknown, "\n⚠Error in conversation - 对话出错!", cancellationToken);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
            sw.Stop();
        }

        TransactionLog? transactionLog = null;
        UserModelTransactionLog? userModelTransactionLog = null;
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            userModelTransactionLog = new()
            {
                UserModelId = userModel.Id,
                CreatedAt = DateTime.UtcNow,
                CountAmount = -cost.CostCount,
                TokenAmount = -cost.CostTokens,
                TransactionTypeId = (byte)DBTransactionType.ApiCost,
            };
        }
        if (cost.CostBalance > 0)
        {
            transactionLog = new()
            {
                UserId = currentApiKey.User.Id,
                CreatedAt = DateTime.UtcNow,
                CreditUserId = currentApiKey.User.Id,
                Amount = -cost.CostBalance,
                TransactionTypeId = (byte)DBTransactionType.ApiCost,
            };
        }
        UserApiUsage usage = new()
        {
            ModelId = cm.Id,
            CreatedAt = DateTime.UtcNow,
            ApiKeyId = currentApiKey.ApiKeyId,
            DurationMs = (int)sw.ElapsedMilliseconds,
            InputCost = cost.InputTokenPrice,
            InputTokenCount = lastSegment.InputTokenCount,
            OutputCost = cost.OutputTokenPrice,
            OutputTokenCount = lastSegment.OutputTokenCount,
            TransactionLog = transactionLog,
        };
        db.UserApiUsages.Add(usage);
        await db.SaveChangesAsync(cancellationToken);
        if (cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(currentApiKey.User.Id, CancellationToken.None);
        }

        if (cco.IsStreamed())
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

    private BadRequestObjectResult InvalidModel(string? modelName)
    {
        return ErrorMessage(OpenAICompatibleErrorCode.InvalidModel, $"The model `{modelName}` does not exist or you do not have access to it.");
    }

    [HttpGet("models")]
    public async Task<ActionResult<ModelListDto>> GetModels(CancellationToken cancellationToken)
    {
        UserModel2[] models = await userModelManager.GetValidModelsByApiKey(currentApiKey.ApiKey, cancellationToken);
        return Ok(new ModelListDto
        {
            Object = "list",
            Data = models.Select(x => new ModelListItemDto
            {
                Id = x.Model.Name,
                Created = new DateTimeOffset(x.CreatedAt, TimeSpan.Zero).ToUnixTimeSeconds(),
                Object = "model",
                OwnedBy = x.Model.ModelKey.Name
            }).ToArray()
        });
    }
}
