using Chats.BE.Controllers.Admin.AdminUser.Dtos;
using Chats.BE.Controllers.Admin.Common;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Chats.BE.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.AdminUser;

[Route("api/admin/users"), AuthorizeAdmin]
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
            UserModelCount = x.UserModels.Count(x => !x.IsDeleted && !x.Model.IsDeleted), 
            Models = x.UserModels.ToArray(),
        }), pagingRequest, x => x.ToDto(), cancellationToken);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto dto, [FromServices] PasswordHasher passwordHasher, CancellationToken cancellationToken)
    {
        User? user = await db.Users.FindAsync([dto.UserId], cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        dto.ApplyToUser(user, passwordHasher);
        if (db.ChangeTracker.HasChanges())
        {
            user.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto, [FromServices] PasswordHasher passwordHasher, [FromServices] UserManager userManager, CancellationToken cancellationToken)
    {
        User? existingUser = await db.Users.FirstOrDefaultAsync(x => x.Account == dto.UserName, cancellationToken);
        if (existingUser != null)
        {
            return BadRequest("User existed");
        }

        User user = new()
        {
            Id = Guid.NewGuid(),
            Account = dto.UserName,
            Username = dto.UserName,
            Email = dto.Email,
            Phone = dto.Phone,
            Role = dto.Role,
            Avatar = dto.Avatar,
            Enabled = dto.Enabled ?? false,
            Provider = null,
            Password = passwordHasher.HashPassword(dto.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.Users.Add(user);
        await userManager.InitializeUserWithoutSave(user, null, null, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return Created();
    }
}
