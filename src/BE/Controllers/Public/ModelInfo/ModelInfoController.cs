using Chats.BE.Controllers.Public.ModelInfo.DTOs;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.ModelInfo;

[ResponseCache(CacheProfileName = "ModelInfo")]
public class ModelInfoController(ChatsDB db) : ControllerBase
{
    [HttpGet, Route("api/model-provider")]
    public async Task<ActionResult<short[]>> List(CancellationToken cancellationToken)
    {
        short[] data = await db.ModelProviders
            .Select(x => x.Id)
            .ToArrayAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet, Route("api/model-provider/{modelProviderId:int}/initial-config")]
    public async Task<ActionResult<InitialModelKeyConfigDto>> GetInitialConfig(short modelProviderId, CancellationToken cancellationToken)
    {
        InitialModelKeyConfigDto? data = await db.ModelProviders
            .Where(x => x.Id == modelProviderId)
            .Select(x => new InitialModelKeyConfigDto
            {
                InitialHost = x.InitialHost,
                InitialSecret = x.InitialSecret,
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null)
        {
            return NotFound();
        }
        return Ok(data);
    }

    [HttpGet, Route("api/model-provider/{modelProviderId:int}/models")]
    public async Task<ActionResult<SimpleModelReferenceDto[]>> GetModelProviderModels(short modelProviderId, CancellationToken cancellationToken)
    {
        SimpleModelReferenceDto[] data = await db.ModelReferences
            .Where(x => x.ProviderId == modelProviderId)
            .Select(x => new SimpleModelReferenceDto
            {
                Id = x.Id,
                Name = x.Name,
            })
            .ToArrayAsync(cancellationToken);

        return Ok(data);
    }

    [HttpGet, Route("api/model-reference/{modelId:int}")]
    public async Task<ActionResult<ModelReferenceDto>> GetModelReference(short modelId, CancellationToken cancellationToken)
    {
        ModelReferenceDto? data = await db.ModelReferences
            .Where(x => x.Id == modelId)
            .Select(x => new ModelReferenceDto
            {
                Id = x.Id,
                Name = x.Name,
                AllowSearch = x.AllowSearch,
                AllowVision = x.AllowVision,
                MaxTemperature = x.MaxTemperature,
                MinTemperature = x.MinTemperature,
                ModelProviderId = (DBModelProvider)x.ProviderId,
                PromptTokenPrice1M = x.InputTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate,
                ResponseTokenPrice1M = x.OutputTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate,
                ContextWindow = x.ContextWindow,
                MaxResponseTokens = x.MaxResponseTokens,
                RawPromptTokenPrice1M = x.InputTokenPrice1M,
                RawResponseTokenPrice1M = x.OutputTokenPrice1M,
                CurrencyCode = x.CurrencyCode,
                ExchangeRate = x.CurrencyCodeNavigation.ExchangeRate,
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null)
        {
            return NotFound();
        }

        return Ok(data);
    }
}