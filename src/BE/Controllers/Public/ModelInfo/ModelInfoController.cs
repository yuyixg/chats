using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.Controllers.Public.ModelInfo.DTOs;
using Chats.BE.DB;
using Chats.BE.DB.Enums;
using Chats.BE.DB.Jsons;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.ModelInfo;

public class ModelInfoController(ChatsDB db) : ControllerBase
{
    [HttpGet, Route("api/model-provider")]
    public async Task<ActionResult<ModelProviderDto>> List(CancellationToken cancellationToken)
    {
        ModelProviderDto[] data = await db.ModelProviders
            .Select(x => new ModelProviderDto
            {
                Id = x.Id,
                Name = x.Name,
                DisplayName = x.DisplayName,
                Icon = x.Icon,
                InitialHost = x.Host,
                InitialSecret = x.ApiKey,
                ModelReferences = x.ModelReferences
                    .Select(y => new SimpleModelReferenceDto
                    {
                        Id = y.Id,
                        Name = y.Name,
                    })
                    .ToArray()
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
                PromptTokenPrice1M = x.PromptTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate,
                ResponseTokenPrice1M = x.ResponseTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null)
        {
            return NotFound();
        }

        return Ok(data);
    }

    [Obsolete("for old frontend compatibility")]
    [HttpGet, Route("api/legacy-model-reference/{modelProviderName:required}/{modelReferenceName:required}")]
    public async Task<ActionResult<LegacyModelReferenceDto>> GetLegacyModelReference(string modelProviderName, string modelReferenceName, CancellationToken cancellationToken)
    {
        LegacyModelReferenceDto? data = await db.ModelReferences
            .Where(x => x.Provider.Name == modelProviderName && x.Name == modelReferenceName)
            .Select(x => new LegacyModelReferenceDto
            {
                Id = x.Id,
                Config = new TemperatureOptions(x.MinTemperature, x.MaxTemperature),
                FileConfig = x.AllowVision ? JsonFileConfig.Default : null,
                ModelConfig = new JsonModelConfig
                {
                    Prompt = ConversationService.DefaultPrompt,
                    Temperature = ConversationService.DefaultTemperature,
                    EnableSearch = x.AllowSearch ? true : null,
                    MaxLength = x.MaxResponseTokens,
                    DeploymentName = x.Name,
                },
                PriceConfig = new JsonPriceConfig()
                {
                    InputTokenPrice = x.PromptTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate / 1_000_000,
                    OutputTokenPrice = x.ResponseTokenPrice1M * x.CurrencyCodeNavigation.ExchangeRate / 1_000_000,
                },
                ProviderName = x.Provider.Name,
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null)
        {
            return NotFound();
        }

        return Ok(data);
    }

    [Obsolete("for old frontend compatibility")]
    [HttpGet, Route("api/legacy-model-provider/{modelProviderName}")]
    public async Task<ActionResult<LegacyModelProviderDto>> GetLegacyModelProviderByName(string modelProviderName, CancellationToken cancellationToken)
    {
        LegacyModelProviderDto? data = await db.ModelProviders
            .Where(x => x.Name == modelProviderName)
            .Select(x => new LegacyModelProviderDto
            {
                Name = x.Name,
                DisplayName = x.DisplayName,
                Icon = x.Icon,
                ApiConfig = new JsonModelKey { Host = x.Host, Secret = x.ApiKey },
                Models = x.ModelReferences.Select(x => x.Name).ToArray()
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (data == null) return NotFound();
        return Ok(data);
    }

    [Obsolete("for old frontend compatibility")]
    [HttpGet, Route("api/legacy-model-provider")]
    public async Task<ActionResult<LegacyModelProviderDto[]>> GetAllLegacyModelProviders(CancellationToken cancellationToken)
    {
        LegacyModelProviderDto[] data = await db.ModelProviders
            .Select(x => new LegacyModelProviderDto
            {
                Name = x.Name,
                DisplayName = x.DisplayName,
                Icon = x.Icon,
                ApiConfig = new JsonModelKey { Host = x.Host, Secret = x.ApiKey },
                Models = x.ModelReferences.Select(x => x.Name).ToArray()
            })
            .ToArrayAsync(cancellationToken);
        return Ok(data);
    }
}