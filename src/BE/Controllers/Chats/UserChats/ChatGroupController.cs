using Chats.BE.Controllers.Chats.UserChats.Dtos;
using Chats.BE.Controllers.Common.Dtos;
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
                IsExpanded = x.IsExpanded,
            })
            .ToArrayAsync(cancellationToken);
        return Ok(groups);
    }

    [HttpGet("with-messages")]
    public async Task<ActionResult<ChatGroupDtoWithMessage[]>> ListGroupsWithMessages([FromQuery] PagingRequest req, [FromServices] IServiceScopeFactory scopeFactory, CancellationToken cancellationToken)
    {
        List<ChatGroupDtoWithMessage> groups = await db.ChatGroups
            .OrderBy(x => x.Rank)
            .ThenBy(x => x.Name)
            .Where(x => x.UserId == user.Id)
            .Select(x => new ChatGroupDtoWithMessage
            {
                Id = urlEncryption.EncryptChatGroupId(x.Id),
                Name = x.Name,
                Rank = x.Rank,
                IsExpanded = x.IsExpanded,
            })
            .ToListAsync(cancellationToken);
        groups.Add(new ChatGroupDtoWithMessage()
        {
            Id = null!,
            Name = "Ungrouped",
            IsExpanded = true,
            Rank = 0,
        });

        await Parallel.ForEachAsync(groups, cancellationToken, async (group, ct) =>
        {
            using IServiceScope scope = scopeFactory.CreateScope();
            using ChatsDB db = scope.ServiceProvider.GetRequiredService<ChatsDB>();
            group.Messages = await UserChatsController.GetChatsForGroupAsync(db, user, urlEncryption, new ChatsQuery(group.Id, req.Page, req.PageSize, req.Query), ct);
        });

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
            IsExpanded = req.IsExpanded,
        };
        db.ChatGroups.Add(group);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new ChatGroupDto
        {
            Id = urlEncryption.EncryptChatGroupId(group.Id),
            Name = group.Name,
            Rank = group.Rank,
            IsExpanded = group.IsExpanded,
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
        group.IsExpanded = req.IsExpanded;
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
