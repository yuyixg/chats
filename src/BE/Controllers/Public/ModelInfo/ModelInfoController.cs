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

    [HttpGet, Route("api/model-provider/{modelProviderId:int}")]
    public async Task<ActionResult<ModelProviderDto>> GetModelProvider(short modelProviderId, CancellationToken cancellationToken)
    {
        ModelProviderDto? data = await db.ModelProviders
            .Where(x => x.Id == modelProviderId)
            .Select(x => new ModelProviderDto
            {
                Id = x.Id,
                InitialHost = x.InitialHost,
                InitialSecret = x.InitialSecret,
                ModelReferences = x.ModelReferences
                    .Select(y => new SimpleModelReferenceDto
                    {
                        Id = y.Id,
                        Name = y.Name,
                    })
                    .ToArray()
            })
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null)
        {
            return NotFound();
        }

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
                PromptTokenPrice1M = x.PromptTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate,
                ResponseTokenPrice1M = x.ResponseTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate,
                ContextWindow = x.ContextWindow,
                MaxResponseTokens = x.MaxResponseTokens,
                RawPromptTokenPrice1M = x.PromptTokenPrice1M,
                RawResponseTokenPrice1M = x.ResponseTokenPrice1M,
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