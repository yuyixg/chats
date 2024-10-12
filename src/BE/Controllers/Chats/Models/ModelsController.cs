using Chats.BE.Controllers.Chats.Models.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Extensions;
using Chats.BE.DB.Jsons;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Controllers.Chats.Models;

[Route("api/models"), Authorize]
public class ModelsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ModelResponse[]>> Get([FromServices] ChatsDB db, [FromServices] CurrentUser user, CancellationToken cancellationToken)
    {
        string? userModelsString = (await db.UserModels.SingleOrDefaultAsync(x => x.UserId == user.Id, cancellationToken))?.Models;
        JsonTokenBalance[] userModels = userModelsString == null ? [] : JsonSerializer.Deserialize<JsonTokenBalance[]>(userModelsString)!;
        HashSet<Guid> chatModelIds = userModels.Select(x => x.ModelId).ToHashSet();
        Dictionary<Guid, ChatModel> chatModels = await db.ChatModels
            .Where(x => chatModelIds.Contains(x.Id) && x.Enabled)
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        HashSet<Guid> fileServiceIds = chatModels.Values.Select(x => x.FileServiceId).Where(x => x != null).Select(x => x!.Value).ToHashSet();
        Dictionary<Guid, FileService> fileServices = await db.FileServices
            .Where(x => fileServiceIds.Contains(x.Id) && x.Enabled)
            .ToDictionaryAsync(x => x.Id, cancellationToken);
        HashSet<ModelIdentifier> modelIds = chatModels.Values
            .Select(x => x.ToIdentifier())
            .ToHashSet();
        Dictionary<ModelIdentifier, TemperatureOptions> temperatureOptions = db.ModelReferences
            .Select(x => new
            {
                ModelId = new ModelIdentifier(x.Provider.Name, x.Name),
                TemperatureOptions = new TemperatureOptions(x.MinTemperature, x.MaxTemperature)
            })
            .AsEnumerable()
            .Where(x => modelIds.Contains(x.ModelId))
            .ToDictionary(x => x.ModelId, x => x.TemperatureOptions);

        return Ok(userModels
            .Where(x => x.Enabled && chatModels.ContainsKey(x.ModelId))
            .Select(userModel =>
            {
                ChatModel chatModel = chatModels[userModel.ModelId];
                FileService? fileService = chatModel.FileServiceId == null ? null :
                    fileServices.TryGetValue(chatModel.FileServiceId!.Value, out FileService? fs) ? fs :
                    null;
                JsonModelConfig modelConfig = JsonSerializer.Deserialize<JsonModelConfig>(chatModel.ModelConfig)!;
                TemperatureOptions temperatureOption = temperatureOptions[chatModel.ToIdentifier()];
                return ModelResponse.FromAll(chatModel, userModel, modelConfig, fileService, temperatureOption);
            })
            .ToArray());
    }
}
