using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Chats.Conversations;

/// <summary>
/// Note: This controller is only valid for backward compatibility, no use in the new .NET API.
/// </summary>
[Route("api/user/chat-stop"), Authorize]
public class StopChatController : ControllerBase
{
    [HttpPost]
    public NoContentResult Stub()
    {
        return NoContent();
    }
}
