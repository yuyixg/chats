using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.LoginServices.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.LoginServices;

[Route("api/admin/login-service2"), AuthorizeAdmin]
public class LoginServiceController : ControllerBase
{
    public async Task<ActionResult<LoginServiceDto>> GetLoginServices(CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
