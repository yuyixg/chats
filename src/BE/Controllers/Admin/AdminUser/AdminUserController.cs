using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.AdminUser;

[Route("api/admin/users"), Authorize(Roles = "admin")]
public class AdminUserController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetUsers(PagingRequest pagingRequest, CancellationToken cancellationToken)
    {
        IQueryable<User> query = db.Users
            .OrderByDescending(x => x.UpdatedAt);
        if (!string.IsNullOrEmpty(pagingRequest.Query))
        {
            query = query.Where(x => x.Account == pagingRequest.Query);
        }

        return await PagedResult.FromTempQuery(query.Select(x => new AdminUserDtoTemp()
        {
            Id = x.Id, 
            Username = x.Username, 
            Account = x.Account,
            Balance = x.UserBalance!.Balance.ToString(),
            Role = x.Role,
            Avatar = x.Avatar,
            Phone = x.Phone,
            Email = x.Email,
            Provider = x.Provider,
            Enabled = x.Enabled,
            CreatedAt = x.CreatedAt,
            UserModelId = x.UserModel!.Id,
            Models = x.UserModel!.Models,
        }), pagingRequest, x => x.ToDto(), cancellationToken);
    }
}
