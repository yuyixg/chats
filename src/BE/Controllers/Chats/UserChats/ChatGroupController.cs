using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.UrlEncryption;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.UserChats;

[Route("api/chat/group"), Authorize]
public class ChatGroupController(ChatsDB db, CurrentUser user, IUrlEncryptionService urlEncryption) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ChatGroupDto[]>> ListGroups(CancellationToken cancellationToken)
    {
        ChatGroupDto[] groups = await db.ChatGroups
            .OrderBy(x => x.Rank)
            .ThenBy(x => x.Name)
            .Where(x => x.UserId == user.Id)
            .Select(x => new ChatGroupDto
            {
                Id = urlEncryption.EncryptChatGroupId(x.Id),
                Name = x.Name,
                Rank = x.Rank,
                IsCollapsed = x.IsCollapsed,
            })
            .ToArrayAsync(cancellationToken);
        return Ok(groups);
    }

    [HttpPost]
    public async Task<ActionResult<ChatGroupDto>> CreateGroup([FromBody] CreateChatGroupRequest req, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
        {
            return BadRequest("Group name cannot be empty");
        }
        bool isDuplicatedName = await db.ChatGroups.AnyAsync(x => x.UserId == user.Id && x.Name == req.Name, cancellationToken);
        if (isDuplicatedName)
        {
            return BadRequest("Group name already exists");
        }

        ChatGroup group = new()
        {
            Name = req.Name,
            UserId = user.Id,
            Rank = req.Rank,
            IsCollapsed = req.IsCollapsed,
        };
        db.ChatGroups.Add(group);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new ChatGroupDto
        {
            Id = urlEncryption.EncryptChatGroupId(group.Id),
            Name = group.Name,
            Rank = group.Rank,
            IsCollapsed = group.IsCollapsed,
        });
    }

    [HttpPut("{encryptedChatGroupId}")]
    public async Task<ActionResult> UpdateGroup(string encryptedChatGroupId, [FromBody] CreateChatGroupRequest req, CancellationToken cancellationToken)
    {
        int chatGroupId = urlEncryption.DecryptChatGroupId(encryptedChatGroupId);
        ChatGroup? group = await db.ChatGroups.FirstOrDefaultAsync(x => x.UserId == user.Id && x.Id == chatGroupId, cancellationToken);
        if (group == null)
        {
            return NotFound();
        }
        group.Name = req.Name;
        group.Rank = req.Rank;
        group.IsCollapsed = req.IsCollapsed;
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpDelete("{encryptedChatGroupId}")]
    public async Task<ActionResult> DeleteGroup(string encryptedChatGroupId, CancellationToken cancellationToken)
    {
        int chatGroupId = urlEncryption.DecryptChatGroupId(encryptedChatGroupId);
        ChatGroup? group = await db.ChatGroups.FirstOrDefaultAsync(x => x.UserId == user.Id && x.Id == chatGroupId, cancellationToken);
        if (group == null)
        {
            return NotFound();
        }
        db.ChatGroups.Remove(group);
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }
}
