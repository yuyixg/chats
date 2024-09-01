using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.LoginServices.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.LoginServices;

[Route("api/admin/login-service"), AuthorizeAdmin]
public class LoginServiceController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public LoginServiceDto[] GetLoginServices()
    {
        LoginServiceDto[] result = db.LoginServices
            .Select(x => new LoginServiceDtoTemp()
            {
                Id = x.Id,
                Type = x.Type,
                Configs = x.Configs,
                Enabled = x.Enabled,
                CreatedAt = x.CreatedAt
            })
            .AsEnumerable()
            .Select(x => x.ToDto())
            .ToArray();
        return result;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateLoginService([FromBody] LoginServiceUpdateRequest dto, CancellationToken cancellationToken)
    {
        LoginService? entity = await db.LoginServices.FindAsync([dto.Id], cancellationToken);
        if (entity == null)
        {
            return NotFound();
        }

        dto.ApplyTo(entity);
        if (db.ChangeTracker.HasChanges())
        {
            entity.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
        return NoContent();
    }
}
