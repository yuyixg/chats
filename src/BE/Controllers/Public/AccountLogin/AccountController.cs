using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Chats.BE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.AccountLogin;

[Route("api/public/account-login")]
public class AccountLoginController(ChatsDB _db, ILogger<AccountLoginController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, [FromServices] PasswordHasher passwordHasher, CancellationToken cancellationToken)
    {
        object dto = request.AsLoginDto();
        if (dto is WeChatLoginRequest)
        {
            return new OldBEActionResult();
        }
        else if (dto is PasswordLoginRequest passwordDto)
        {
            User? dbUser = await _db.Users.FirstOrDefaultAsync(x =>
                x.Account == passwordDto.UserName ||
                x.Phone == passwordDto.UserName ||
                x.Email == passwordDto.UserName, cancellationToken);

            if (dbUser == null)
            {
                logger.LogWarning("User not found: {UserName}", passwordDto.UserName);
                return BadRequest("用户名或密码错误");
            }
            if (!dbUser.Enabled)
            {
                logger.LogWarning("User disabled: {UserName}", passwordDto.UserName);
                return BadRequest("用户名或密码错误");
            }
            if (!passwordHasher.VerifyPassword(passwordDto.Password, dbUser.Password))
            {
                logger.LogWarning("Invalid password: {UserName}", passwordDto.UserName);
                return BadRequest("用户名或密码错误");
            }

            bool hasPayService = await _db.PayServices.Where(x => x.Enabled).AnyAsync(cancellationToken);

            await _db.Sessions.Where(x => x.UserId == dbUser.Id).ExecuteDeleteAsync(cancellationToken);
            Session session = new()
            {
                UserId = dbUser.Id,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
            };
            _db.Sessions.Add(session);
            _db.SaveChanges();

            return Ok(new LoginResponse
            {
                SessionId = session.Id,
                UserName = dbUser.Username,
                Role = dbUser.Role,
                CanReCharge = hasPayService,
            });
        }
        else
        {
            throw new InvalidOperationException("Invalid login request.");
        }
    }
}
