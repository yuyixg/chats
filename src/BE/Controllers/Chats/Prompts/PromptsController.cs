using Chats.BE.Controllers.Chats.Prompts.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Prompts;

[Route("api/prompts"), Authorize]
public class PromptsController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PromptDto[]>> GetPrompts(CancellationToken cancellationToken)
    {
        PromptDto[] prompts = await db.Prompts
            .Where(x => x.CreateUserId == currentUser.Id && !x.IsSystem)
            .OrderBy(x => x.UpdatedAt)
            .Select(x => new PromptDto()
            {
                Content = x.Content,
                Id = x.Id,
                Name = x.Name,
                IsDefault = x.IsDefault,
                UpdatedAt = x.UpdatedAt
            })
            .ToArrayAsync(cancellationToken);
        return Ok(prompts);
    }

    [HttpGet("brief")]
    public async Task<ActionResult<BriefPromptDto[]>> GetBriefPrompts(CancellationToken cancellationToken)
    {
        BriefPromptDto[] prompts = await db.Prompts
            .Where(x => x.CreateUserId == currentUser.Id && !x.IsSystem)
            .OrderBy(x => x.UpdatedAt)
            .Select(x => new BriefPromptDto()
            {
                Id = x.Id,
                Name = x.Name,
                IsDefault = x.IsDefault,
                UpdatedAt = x.UpdatedAt
            })
            .ToArrayAsync(cancellationToken);
        return Ok(prompts);
    }

    [HttpGet("{promptId:int}")]
    public async Task<ActionResult<PromptDto>> GetSinglePrompt(int promptId, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == promptId && (x.IsSystem || x.CreateUserId == currentUser.Id), cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        return Ok(new PromptDto()
        {
            Content = prompt.Content,
            Id = prompt.Id,
            Name = prompt.Name,
            IsDefault = prompt.IsDefault,
            UpdatedAt = prompt.UpdatedAt
        });
    }

    [HttpGet("default")]
    public async Task<ActionResult<PromptDto>> GetDefaultPrompt(CancellationToken cancellationToken)
    {
        Prompt? userDefault = await db.Prompts
                .OrderByDescending(x => x.UpdatedAt)
                .Where(x => x.IsDefault && x.CreateUserId == currentUser.Id)
                .FirstOrDefaultAsync(cancellationToken)
                ??
            await db.Prompts
                .OrderByDescending(x => x.UpdatedAt)
                .Where(x => x.IsDefault && x.IsSystem)
                .FirstOrDefaultAsync(cancellationToken);

        PromptDto dto = userDefault != null ? new PromptDto()
        {
            Content = userDefault.Content,
            Id = userDefault.Id,
            Name = userDefault.Name,
            IsDefault = userDefault.IsDefault,
            UpdatedAt = userDefault.UpdatedAt,
            IsSystem = true,
        } : new PromptDto()
        {
            Content = ConversationService.DefaultPrompt,
            Id = -1,
            IsDefault = true,
            Name = "Default",
            UpdatedAt = DateTime.UtcNow,
            IsSystem = true
        };

        return Ok(userDefault);
    }

    [HttpPost]
    public async Task<ActionResult<BriefPromptDto>> CreatePrompt([FromBody] CreatePromptDto request, CancellationToken cancellationToken)
    {
        Prompt prompt = request.ToPrompt(currentUser.Id, currentUser.IsAdmin);

        db.Prompts.Add(prompt);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new BriefPromptDto()
        {
            Id = prompt.Id,
            IsDefault = prompt.IsDefault,
            Name = prompt.Name,
            UpdatedAt = prompt.UpdatedAt
        });
    }

    [HttpDelete]
    public async Task<ActionResult> DeletePrompt([FromQuery] int id, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == id && x.CreateUserId == currentUser.Id, cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        db.Prompts.Remove(prompt);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut]
    public async Task<ActionResult<PromptDto>> UpdatePrompt([FromBody] PromptDto request, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == request.Id && x.CreateUserId == currentUser.Id, cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        request.ApplyTo(prompt, currentUser.IsAdmin);
        if (db.ChangeTracker.HasChanges())
        {
            prompt.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(cancellationToken);
        return Ok(request);
    }
}
