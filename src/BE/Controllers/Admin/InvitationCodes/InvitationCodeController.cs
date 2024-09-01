using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.InvitationCodes.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.InvitationCodes;

[Route("api/admin/invitation-code"), AuthorizeAdmin]
public class InvitationCodeController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<InvitationCodeDto[]>> GetInvitationCodes(CancellationToken cancellationToken)
    {
        InvitationCodeDto[] data = await db.InvitationCodes
            .Select(x => new InvitationCodeDto()
            {
                Id = x.Id,
                Value = x.Value, 
                Count = x.Count, 
                Username = db.Users
                    .Where(u => u.Id == x.CreateUserId)
                    .Select(x => x.Username)
                    .Single()
            })
            .ToArrayAsync(cancellationToken);
        return Ok(data);
    }
}
