using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Common;

public static class ControllerBaseExtensions
{
    public static BadRequestObjectResult BadRequestMessage(this ControllerBase controller, string message)
    {
        return controller.BadRequest(new { message });
    }
}
