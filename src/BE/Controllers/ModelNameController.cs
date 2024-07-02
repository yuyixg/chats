using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers;

[Route("api/[controller]")]
public class ModelNameController(ChatsDB _db) : ControllerBase
{
    [HttpGet]
    public ActionResult<string[]> Get()
    {
        return Ok(_db.ChatModels.Select(x => x.Name));
    }
}
