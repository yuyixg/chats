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
    public async Task<ActionResult> LegacyChangePassword([FromBody] LegacyChangePasswordRequest req, CancellationToken cancellationToken)
    {
        if (!IsStrongEnoughPassword(req.NewPassword))
        {
            return this.BadRequestMessage("Password should be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one digit");
        }

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
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut("reset-password")]
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest req, CancellationToken cancellationToken)
    {
        if (req.NewPassword != req.ConfirmPassword)
        {
            return this.BadRequestMessage("New password and confirm password do not match");
        }

        if (!IsStrongEnoughPassword(req.NewPassword))
        {
            return this.BadRequestMessage("Password should be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, and one digit");
        }

        User? user = await db.Users
            .Where(x => x.Id == currentUser.Id)
            .FirstOrDefaultAsync(cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        if (!passwordHasher.VerifyPassword(req.OldPassword, user.Password))
        {
            return this.BadRequestMessage("Old password incorrect");
        }

        if (passwordHasher.VerifyPassword(req.NewPassword, user.Password))
        {
            return this.BadRequestMessage("New password should be different from the old one");
        }

        user.Password = passwordHasher.HashPassword(req.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    private static bool IsStrongEnoughPassword(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 6)
        {
            return false;
        }

        bool hasLowercase = false;
        bool hasUppercase = false;
        bool hasDigit = false;

        foreach (char c in password)
        {
            if (char.IsLower(c))
            {
                hasLowercase = true;
            }
            else if (char.IsUpper(c))
            {
                hasUppercase = true;
            }
            else if (char.IsDigit(c))
            {
                hasDigit = true;
            }
        }

        return hasLowercase && hasUppercase && hasDigit;
    }
}
