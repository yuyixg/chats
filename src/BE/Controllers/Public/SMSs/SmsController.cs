using Chats.BE.DB;
using Chats.BE.Services.Common;
using Chats.BE.Services.Configs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TencentCloud.Common;
using TencentCloud.Sms.V20210111;
using TencentCloud.Sms.V20210111.Models;

namespace Chats.BE.Controllers.Public.SMSs;

[Route("api/public/sms")]
public class SmsController(ChatsDB db, GlobalDBConfig globalConfig, ILogger<SmsController> logger) : ControllerBase
{
    public const int SmsExpirationSeconds = 300;

    [HttpPost]
    public async Task<IActionResult> SendSms([FromBody] SmsRequest req, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequestMessage("Invalid phone.");
        }
        if (!db.LoginServices.Any(x => x.Type == KnownLoginProviders.Phone))
        {
            return BadRequestMessage("Phone login is not enabled.");
        }

        Sms? existingSms = await db.Sms
            .Where(x => x.SignName == req.Phone && x.Type == (short)SmsType.Login && x.Status == (short)SmsStatus.WaitingForVerification)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (existingSms != null)
        {
            if (existingSms.CreatedAt + TimeSpan.FromSeconds(SmsExpirationSeconds) > DateTime.UtcNow)
            {
                return BadRequestMessage("Sms already sent.");
            }
        }

        User? user = await db.Users.FirstOrDefaultAsync(x => x.Phone == req.Phone, cancellationToken);

        if (req.Type == SmsType.Login && user == null)
        {
            return BadRequestMessage("Phone number not registered.");
        }
        else if (req.Type == SmsType.Register && user != null)
        {
            return BadRequestMessage("Phone number already registered.");
        }

        string code = Random.Shared.Next(999999).ToString("D6");
        TencentSmsConfig smsConfig = await globalConfig.GetTencentSmsConfig(cancellationToken);
        SmsClient smsClient = new(new Credential
        {
            SecretId = smsConfig.SecretId,
            SecretKey = smsConfig.SecretKey
        }, "ap-guangzhou");

        SendSmsResponse resp = await smsClient.SendSms(new SendSmsRequest()
        {
            PhoneNumberSet = [req.Phone],
            SignName = smsConfig.SignName,
            TemplateId = smsConfig.TemplateId,
            TemplateParamSet = [code],
            SmsSdkAppId = smsConfig.SdkAppId
        });
        if (resp.SendStatusSet.Length == 0)
        {
            logger.LogError("Failed to send sms to {phone}, no response.", req.Phone);
            return BadRequestMessage("Failed to send sms.");
        }
        else if (resp.SendStatusSet[0].Code != "Ok")
        {
            logger.LogError("Failed to send sms to {phone}, code: {code}, message: {message}", 
                req.Phone, 
                resp.SendStatusSet[0].Code, 
                resp.SendStatusSet[0].Message);
            return BadRequestMessage("Failed to send sms.");
        }

        db.Sms.Add(new Sms
        {
            Id = Guid.NewGuid(),
            SignName = req.Phone,
            Type = (short)req.Type,
            Status = (short)SmsStatus.WaitingForVerification,
            Code = code,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    private BadRequestObjectResult BadRequestMessage(string message)
    {
        return BadRequest(new { message });
    }
}
