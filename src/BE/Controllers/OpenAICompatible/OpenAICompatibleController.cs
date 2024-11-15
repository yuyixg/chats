﻿using Chats.BE.Controllers.Chats.Conversations;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.OpenAIApiKeySession;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sdcb.DashScope;
using System.ClientModel;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Chats.BE.DB.Enums;
using System.Diagnostics;
using System.Text;
using Chats.BE.Services.Common;
using System.Text.Json.Nodes;
using Chats.BE.Controllers.OpenAICompatible.Dtos;

namespace Chats.BE.Controllers.OpenAICompatible;

[Route("v1"), Authorize(AuthenticationSchemes = "OpenAIApiKey")]
public partial class OpenAICompatibleController(ChatsDB db, CurrentApiKey currentApiKey, ConversationFactory cf, UserModelManager userModelManager, ILogger<OpenAICompatibleController> logger, BalanceService balanceService) : ControllerBase
{
    [HttpPost("chat/completions")]
    public async Task<ActionResult> ChatCompletion([FromBody] JsonObject json, [FromServices] ClientInfoManager clientInfoManager, CancellationToken cancellationToken)
    {
        CcoWrapper cco = new(json);
        if (!cco.SeemsValid())
        {
            return ErrorMessage(OpenAICompatibleErrorCode.BadParameter, "bad parameter.");
        }
        string? modelName = cco.Model;
        if (string.IsNullOrWhiteSpace(modelName)) return InvalidModel(modelName);

        UserModel? userModel = await userModelManager.GetUserModel(currentApiKey.ApiKey, modelName, cancellationToken);
        if (userModel == null) return InvalidModel(modelName);

        Model cm = userModel.Model;
        using ConversationService s = cf.CreateConversationService(cm);

        UserModelBalanceCost cost = null!;
        var miscInfo = await db.Users
            .Where(x => x.Id == currentApiKey.User.Id)
            .Select(x => new
            {
                UserBalance = x.UserBalance!,
            })
            .SingleAsync(cancellationToken);
        InternalChatSegment lastSegment = InternalChatSegment.Empty;
        Stopwatch sw = Stopwatch.StartNew();
        StringBuilder nonStreamingResult = new();
        BadRequestObjectResult? errorToReturn = null;
        bool hasYield = false;
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

            await foreach (InternalChatSegment seg in s.ChatStreamedSimulated([.. cco.Messages], cco.ToCleanCco(), cancellationToken))
            {
                lastSegment = seg;
                UserModelBalanceCost currentCost = calculator.GetNewBalance(seg.Usage.InputTokens, seg.Usage.OutputTokens, priceConfig);
                if (!currentCost.IsSufficient)
                {
                    throw new InsufficientBalanceException();
                }
                cost = currentCost;
                if (seg.TextSegment == string.Empty) continue;

                if (cco.Stream)
                {
                    ChatCompletionChunk chunk = seg.ToOpenAIChunk(modelName, HttpContext.TraceIdentifier);
                    await YieldResponse(chunk, cancellationToken);
                    hasYield = true;
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
            errorToReturn = await YieldError(hasYield && cco.Stream, OpenAICompatibleErrorCode.InsufficientBalance, "⚠Insufficient balance - 余额不足!", cancellationToken);
        }
        catch (Exception e) when (e is DashScopeException || e is ClientResultException)
        {
            logger.LogError(e, "Upstream error");
            errorToReturn = await YieldError(hasYield && cco.Stream, OpenAICompatibleErrorCode.UpstreamError, e.Message, cancellationToken);
        }
        catch (TaskCanceledException)
        {
            // do nothing if cancelled
        }
        catch (Exception e)
        {
            logger.LogError(e, "Unknown error");
            errorToReturn = await YieldError(hasYield && cco.Stream, OpenAICompatibleErrorCode.Unknown, "\n⚠Error in conversation - 对话出错!", cancellationToken);
        }
        finally
        {
            // cancel the conversation because following code is credit deduction related
            cancellationToken = CancellationToken.None;
            sw.Stop();
        }

        UserApiUsage usage = new()
        {
            ApiKeyId = currentApiKey.ApiKeyId,
            Usage = new UserModelUsage()
            {
                UserModelId = userModel.Id,
                CreatedAt = DateTime.UtcNow,
                DurationMs = (int)sw.ElapsedMilliseconds,
                InputCost = cost.InputTokenPrice,
                InputTokenCount = lastSegment.Usage.InputTokens,
                OutputCost = cost.OutputTokenPrice,
                OutputTokenCount = lastSegment.Usage.OutputTokens,
                ClientInfo = await clientInfoManager.GetClientInfo(CancellationToken.None),
            }
        };
        if (cost.CostBalance > 0)
        {
            usage.Usage.BalanceTransaction = new()
            {
                UserId = currentApiKey.User.Id,
                CreatedAt = usage.Usage.CreatedAt,
                CreditUserId = currentApiKey.User.Id,
                Amount = -cost.CostBalance,
                TransactionTypeId = (byte)DBTransactionType.ApiCost,
            };
        }
        if (cost.CostCount > 0 || cost.CostTokens > 0)
        {
            usage.Usage.UsageTransaction = new()
            {
                UserModelId = userModel.Id,
                CreatedAt = usage.Usage.CreatedAt,
                CountAmount = -cost.CostCount,
                TokenAmount = -cost.CostTokens,
                TransactionTypeId = (byte)DBTransactionType.ApiCost,
            };
        }
        db.UserApiUsages.Add(usage);
        await db.SaveChangesAsync(cancellationToken);
        if (cost.CostBalance > 0)
        {
            _ = balanceService.AsyncUpdateBalance(currentApiKey.User.Id, CancellationToken.None);
        }

        if (hasYield && cco.Stream)
        {
            return new EmptyResult();
        }
        else if (errorToReturn != null)
        {
            return errorToReturn;
        }
        else
        {
            // non-streamed success
            InternalChatSegment seg = lastSegment with { TextSegment = nonStreamingResult.ToString() };
            FullChatCompletion fullChatCompletion = seg.ToOpenAIFullChat(modelName, HttpContext.TraceIdentifier);
            return Ok(fullChatCompletion);
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

    private async Task<BadRequestObjectResult> YieldError(bool shouldStreamed, OpenAICompatibleErrorCode code, string message, CancellationToken cancellationToken)
    {
        if (shouldStreamed)
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
        UserModel[] models = await userModelManager.GetValidModelsByApiKey(currentApiKey.ApiKey, cancellationToken);
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
