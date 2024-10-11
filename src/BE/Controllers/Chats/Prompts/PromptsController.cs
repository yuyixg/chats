using Chats.BE.Controllers.Chats.Prompts.Dtos;
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Chats.Prompts;

[Route("api/prompts"), Authorize]
public class PromptsController(ChatsDB db, CurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PromptsDto[]>> GetPrompts(CancellationToken cancellationToken)
    {
        PromptsDto[] prompts = await db.Prompts
            .Where(x => x.CreateUserId == currentUser.Id)
            .OrderBy(x => x.UpdatedAt)
            .Select(x => new PromptsDto()
            {
                Content = x.Content,
                Id = x.Id, 
                Name = x.Name,
                IsDefault = x.IsDefault,
                IsSystem = x.IsSystem,
                UpdatedAt = x.UpdatedAt
            })
            .ToArrayAsync(cancellationToken);
        return Ok(prompts);
    }

    [HttpGet("brief")]
    public async Task<ActionResult<BriefPromptDto[]>> GetBriefPrompts(CancellationToken cancellationToken)
    {
        BriefPromptDto[] prompts = await db.Prompts
            .Where(x => x.CreateUserId == currentUser.Id)
            .OrderBy(x => x.UpdatedAt)
            .Select(x => new BriefPromptDto()
            {
                Id = x.Id,
                Name = x.Name,
                IsDefault = x.IsDefault,
                IsSystem = x.IsSystem,
                UpdatedAt = x.UpdatedAt
            })
            .ToArrayAsync(cancellationToken);
        return Ok(prompts);
    }

    [HttpGet("{promptId}")]
    public async Task<ActionResult<PromptsDto>> GetSinglePrompt(int promptId, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == promptId && x.CreateUserId == currentUser.Id, cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        return Ok(new PromptsDto()
        {
            Content = prompt.Content,
            Id = prompt.Id,
            Name = prompt.Name,
            IsDefault = prompt.IsDefault,
            IsSystem = prompt.IsSystem,
            UpdatedAt = prompt.UpdatedAt
        });
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
            IsSystem = prompt.IsSystem,
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
    public async Task<ActionResult<PromptsDto>> UpdatePrompt([FromBody] PromptsDto request, CancellationToken cancellationToken)
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
