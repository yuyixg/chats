using Chats.BE.Controllers.Common;
using Chats.BE.Controllers.Public.SMSs.Dtos;
using Chats.BE.DB;
using Chats.BE.Services.Common;
using Chats.BE.Services.Configs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TencentCloud.Common;
using TencentCloud.Sms.V20210111;
using TencentCloud.Sms.V20210111.Models;

namespace Chats.BE.Controllers.Public.SMSs;

[Route("api/public")]
public class SmsController(ChatsDB db, GlobalDBConfig globalConfig, ILogger<SmsController> logger) : ControllerBase
{
    public const int SmsExpirationSeconds = 300;

    [HttpPost("sms")]
    public async Task<IActionResult> SendSms([FromBody] SmsRequest req, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return this.BadRequestMessage("Invalid phone.");
        }
        if (!db.LoginServices.Any(x => x.Enabled && x.Type == KnownLoginProviders.Phone))
        {
            return this.BadRequestMessage("Phone login is not enabled.");
        }

        Sms? existingSms = await db.Sms
            .Where(x => x.SignName == req.Phone && x.Type == (int)req.Type && x.Status == (short)SmsStatus.WaitingForVerification)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingSms != null && existingSms.CreatedAt + TimeSpan.FromSeconds(SmsExpirationSeconds) > DateTime.UtcNow)
        {
            return this.BadRequestMessage("Sms already sent.");
        }

        if (req.Type == SmsType.Login)
        {
            return await SendLoginSms(req.Phone, cancellationToken);
        }
        else if (req.Type == SmsType.Register)
        {
            if (req.InvitationCode == null)
            {
                return this.BadRequestMessage("Invitation code is required.");
            }
            return await SendRegisterSms(req.Phone, req.InvitationCode, cancellationToken);
        }

        return this.BadRequestMessage("Invalid SMS type.");
    }

    async Task<IActionResult> SendLoginSms(string phone, CancellationToken cancellationToken)
    {
        User? user = await db.Users.FirstOrDefaultAsync(x => x.Phone == phone, cancellationToken);
        if (user == null)
        {
            return this.BadRequestMessage("Phone number not registered.");
        }

        return await SendSmsCommon(phone, SmsType.Login, cancellationToken);
    }

    async Task<IActionResult> SendRegisterSms(string phone, string invitationCode, CancellationToken cancellationToken)
    {
        InvitationCode? code = await db.InvitationCodes.FirstOrDefaultAsync(x => x.Value == invitationCode && !x.IsDeleted, cancellationToken);
        if (code == null)
        {
            return this.BadRequestMessage("Invalid invitation code.");
        }
        if (code.Count <= 0)
        {
            return this.BadRequestMessage("Invitation code expired.");
        }

        User? user = await db.Users.FirstOrDefaultAsync(x => x.Phone == phone, cancellationToken);
        if (user != null)
        {
            return this.BadRequestMessage("Phone number already registered.");
        }

        code.Count--;
        logger.LogInformation("Invitation code {code} used, remaining count: {count}", invitationCode, code.Count);

        return await SendSmsCommon(phone, SmsType.Register, cancellationToken);
    }

    async Task<IActionResult> SendSmsCommon(string phone, SmsType type, CancellationToken cancellationToken)
    {
        string code = Random.Shared.Next(999999).ToString("D6");
        TencentSmsConfig smsConfig = await globalConfig.GetTencentSmsConfig(cancellationToken);
        SmsClient smsClient = new(new Credential
        {
            SecretId = smsConfig.SecretId,
            SecretKey = smsConfig.SecretKey
        }, "ap-guangzhou");

        SendSmsResponse resp = await smsClient.SendSms(new SendSmsRequest()
        {
            PhoneNumberSet = [phone],
            SignName = smsConfig.SignName,
            TemplateId = smsConfig.TemplateId,
            TemplateParamSet = [code],
            SmsSdkAppId = smsConfig.SdkAppId
        });
        if (resp.SendStatusSet.Length == 0)
        {
            logger.LogError("Failed to send sms to {phone}, no response.", phone);
            return this.BadRequestMessage("Failed to send sms.");
        }
        else if (resp.SendStatusSet[0].Code != "Ok")
        {
            logger.LogError("Failed to send sms to {phone}, code: {code}, message: {message}",
                phone,
                resp.SendStatusSet[0].Code,
                resp.SendStatusSet[0].Message);
            return this.BadRequestMessage("Failed to send sms.");
        }

        db.Sms.Add(new Sms
        {
            Id = Guid.NewGuid(),
            SignName = phone,
            Type = (short)type,
            Status = (short)SmsStatus.WaitingForVerification,
            Code = code,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
