using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Admin.InitialConfigs.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.InitialConfigs;

[Route("api/admin/user-config"), AuthorizeAdmin]
public class InititalConfigController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public UserInitialConfigDto[] GetUserInitialConfigs()
    {
        UserInitialConfigDto[] data = db.UserInitialConfigs
            .OrderByDescending(x => x.UpdatedAt)
            .Select(x => new UserInitialConfigDtoTemp()
            {
                Id = x.Id,
                Name = x.Name,
                LoginType = x.LoginType ?? "-",
                Models = x.Models,
                Price = x.Price,
                InvitationCodeId = x.InvitationCodeId.ToString() ?? "-",
                InvitationCode = x.InvitationCode!.Value ?? "-",
            })
            .AsEnumerable()
            .Select(x => x.ToDto())
            .ToArray();
        return data;
    }
}
