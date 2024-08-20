using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.ModelKeys.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Chats.BE.Controllers.Admin.ModelKeys;

[Route("api/admin"), AuthorizeAdmin]
public class ModelKeysController(ChatsDB db) : ControllerBase
{
    [HttpGet("model-keys")]
    public ActionResult<ModelKeyDto[]> GetAllModelKeys()
    {
        ModelKeyDto[] result = db.ModelKeys
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new ModelKeyDtoTemp
            {
                Id = x.Id,
                Type = x.Type,
                Name = x.Name,
                Configs = x.Configs,
                CreatedAt = x.CreatedAt,
            })
            .AsEnumerable()
            .Select(x => x.ToDto())
            .ToArray();

        return Ok(result);
    }
}
