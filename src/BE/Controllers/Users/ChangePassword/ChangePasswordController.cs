using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Users.ChangePassword.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Users.ChangePassword;

[Route("api/user"), Authorize]
public class ChangePasswordController(ChatsDB db, CurrentUser currentUser, PasswordHasher passwordHasher) : ControllerBase
{
    [HttpPut("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken cancellationToken)
    {
        User? user = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        if (passwordHasher.VerifyPassword(req.NewPassword, user.Password))
        {
            return this.BadRequestMessage("New password should be different from the old one");
        }

        user.Password = passwordHasher.HashPassword(req.NewPassword);
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }
}
