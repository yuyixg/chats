using Chats.BE.Controllers.Chats.Messages.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Chats.Messages;

[Route("api/messages"), Authorize]
public class MessagesController(ChatsDB db) : ControllerBase
{
    //[HttpGet]
    //public async Task<ActionResult<MessageDto[]>> GetMessages([FromQuery] Guid chatId)
    //{
    //    throw new NotImplementedException();
    //}
}
