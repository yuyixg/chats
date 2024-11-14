using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Extensions;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Common;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Models;

[Route("api/models"), Authorize]
public class ModelsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ModelResponse[]>> Get(int timezoneOffset, [FromServices] ChatsDB db, [FromServices] CurrentUser user, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        string? defaultPrompt = await db.Prompts
            .Where(x => x.IsDefault && x.IsSystem)
            .OrderByDescending(x => x.Id)
            .Select(x => x.Content)
            .FirstOrDefaultAsync(cancellationToken);
        defaultPrompt ??= ConversationService.DefaultPrompt;

        UserModel[] models = await userModelManager.GetValidModelsByUserId(user.Id, cancellationToken);
        ModelResponse[] responses = models
            .Select(x => new ModelResponse()
            {
                FileConfig = x.Model.ModelReference.AllowSearch ? JsonFileConfig.Default : null,
                FileServerConfigs = FileServerConfig.FromFileService(x.Model.FileService),
                Id = x.ModelId,
                ModelConfigOptions = new ModelConfigOption()
                { 
                    Temperature = new TemperatureOptions(x.Model.ModelReference.MinTemperature, x.Model.ModelReference.MaxTemperature),
                },
                ModelConfigs = JsonUserModelConfig.FromJson(new JsonModelConfig()
                {
                    DeploymentName = x.Model.DeploymentName,
                    Prompt = defaultPrompt
                        .Replace("{{MODEL_NAME}}", x.Model.ModelReference.Name)
                        .Replace("{{CURRENT_DATE}}", DateTime.UtcNow.AddMinutes(-timezoneOffset).ToString("yyyy-MM-dd")),
                    Temperature = ConversationService.DefaultTemperature,
                    EnableSearch = x.Model.ModelReference.AllowSearch ? false : null,
                }),
                ModelProvider = x.Model.ModelKey.ModelProvider.Name,
                ModelUsage = ModelUsageResponse.FromDB(x),
                ModelVersion = x.Model.ModelReference.Name,
                Name = x.Model.Name,
            })
            .ToArray();
        return Ok(responses);
    }

    [HttpGet("{modelId}/usage")]
    public async Task<ActionResult<ModelUsageResponse>> GetUsage(short modelId, [FromServices] CurrentUser currentUser, [FromServices] UserModelManager userModelManager, CancellationToken cancellationToken)
    {
        UserModel? model = await userModelManager.GetUserModel(currentUser.Id, modelId, cancellationToken);
        if (model == null) return NotFound();

        ModelUsageResponse response = ModelUsageResponse.FromDB(model);
        return Ok(response);
    }
}
