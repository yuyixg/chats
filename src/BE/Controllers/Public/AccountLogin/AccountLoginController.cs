using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Common.Results;
using Chats.BE.Controllers.Public.AccountLogin.Dtos;
using Chats.BE.Controllers.Public.SMSs;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Chats.BE.Services;
using Chats.BE.Services.Common;
using Chats.BE.Services.Configs;
using Chats.BE.Services.Keycloak;
using Chats.BE.Services.Sessions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Public.AccountLogin;

[Route("api/public")]
public class AccountLoginController(ChatsDB db, ILogger<AccountLoginController> logger, SessionManager sessionManager) : ControllerBase
{
    [HttpPost("account-login")]
    public async Task<ActionResult> Login(
        [FromBody] LoginRequest request,
        [FromServices] PasswordHasher passwordHasher,
        [FromServices] GlobalDBConfig kcStore,
        [FromServices] UserManager userManager,
        [FromServices] HostUrlService hostUrl,
        CancellationToken cancellationToken)
    {
        object dto = request.AsLoginDto();
        if (dto is SsoLoginRequest sso)
        {
            if (sso.Provider == null) // WeChat
            {
                return new OldBEActionResult(sso);
            }
            else if (sso.Provider.Equals(KnownLoginProviders.Keycloak, StringComparison.OrdinalIgnoreCase))
            {
                return await KeycloakLogin(kcStore, userManager, sso, hostUrl, cancellationToken);
            }
        }
        else if (dto is PasswordLoginRequest passwordDto)
        {
            return await PasswordLogin(passwordHasher, passwordDto, cancellationToken);
        }

        throw new InvalidOperationException("Invalid login request.");
    }

    private async Task<ActionResult> KeycloakLogin(GlobalDBConfig kcStore, UserManager userManager, SsoLoginRequest sso, HostUrlService hostUrl, CancellationToken cancellationToken)
    {
        JsonKeycloakConfig? kcConfig = await kcStore.GetKeycloakConfig(cancellationToken);
        if (kcConfig == null)
        {
            return NotFound("Keycloak config not found");
        }

        AccessTokenInfo token = await kcConfig.GetUserInfo(sso.Code, hostUrl.GetKeycloakSsoRedirectUrl(), cancellationToken);
        User user = await userManager.EnsureKeycloakUser(token, cancellationToken);
        return Ok(await sessionManager.GenerateSessionForUser(user, cancellationToken));
    }

    private async Task<ActionResult> PasswordLogin(PasswordHasher passwordHasher, PasswordLoginRequest passwordDto, CancellationToken cancellationToken)
    {
        User? dbUser = await db.Users.FirstOrDefaultAsync(x => x.Account == passwordDto.UserName, cancellationToken);

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

        return Ok(await sessionManager.GenerateSessionForUser(dbUser, cancellationToken));
    }

    [HttpPost("phone-login")]
    public async Task<IActionResult> PhoneLogin([FromBody] SmsLoginRequest req,
        [FromServices] SessionManager sessionManager,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return this.BadRequestMessage("Invalid phone.");
        }
        if (!db.LoginServices.Any(x => x.Enabled && x.Type == KnownLoginProviders.Phone))
        {
            return this.BadRequestMessage("Phone login not enabled.");
        }

        Sms? existingSms = await db.Sms
            .Where(x => x.SignName == req.Phone && x.Type == (short)SmsType.Login && x.Status == (short)SmsStatus.WaitingForVerification)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (existingSms == null)
        {
            return this.BadRequestMessage("Sms not sent.");
        }

        if (existingSms.Code != req.SmsCode)
        {
            db.Remove(existingSms);
            await db.SaveChangesAsync(cancellationToken);
            return this.BadRequestMessage("Invalid code.");
        }

        if (existingSms.CreatedAt + TimeSpan.FromSeconds(SmsController.SmsExpirationSeconds) < DateTime.UtcNow)
        {
            return this.BadRequestMessage("Sms expired.");
        }

        User? user = await db.Users.FirstOrDefaultAsync(x => x.Phone == req.Phone && x.Enabled, cancellationToken);
        if (user == null)
        {
            return this.BadRequestMessage("Phone number not registered.");
        }

        return Ok(await sessionManager.GenerateSessionForUser(user, cancellationToken));
    }

    [HttpPost("phone-register")]
    public async Task<IActionResult> PhoneRegister([FromBody] PhoneRegisterRequest req, [FromServices] UserManager userManager, CancellationToken cancellationToken)
    {
        InvitationCode? code = await db.InvitationCodes.FirstOrDefaultAsync(x => x.Value == req.InvitationCode && !x.IsDeleted, cancellationToken);
        if (code == null)
        {
            return this.BadRequestMessage("Invalid invitation code.");
        }

        User? existingUser = await db.Users.FirstOrDefaultAsync(x => x.Phone == req.Phone, cancellationToken);
        if (existingUser != null)
        {
            return this.BadRequestMessage("Phone number already registered.");
        }

        Sms? existingSms = await db.Sms
            .Where(x => x.SignName == req.Phone && x.Type == (short)SmsType.Register && x.Status == (short)SmsStatus.WaitingForVerification)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (existingSms == null)
        {
            return this.BadRequestMessage("Sms not sent.");
        }

        if (existingSms.Code != req.SmsCode)
        {
            db.Remove(existingSms);
            await db.SaveChangesAsync(cancellationToken);
            return this.BadRequestMessage("Invalid code.");
        }

        if (existingSms.CreatedAt + TimeSpan.FromSeconds(SmsController.SmsExpirationSeconds) < DateTime.UtcNow)
        {
            return this.BadRequestMessage("Sms expired.");
        }

        User user = new()
        {
            Id = Guid.NewGuid(),
            Phone = req.Phone,
            Enabled = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Account = req.Phone,
            Username = req.Phone,
            Password = null,
            Avatar = null,
            Email = null, 
            Provider = KnownLoginProviders.Phone,
            Role = "-",
            Sub = null, 
        };
        user.UserInvitation = new UserInvitation()
        {
            UserId = user.Id,
            InvitationCodeId = code.Id,
        };
        db.Users.Add(user);
        await userManager.InitializeUserWithoutSave(user, KnownLoginProviders.Phone, req.InvitationCode, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(await sessionManager.GenerateSessionForUser(user, cancellationToken));
    }
}
