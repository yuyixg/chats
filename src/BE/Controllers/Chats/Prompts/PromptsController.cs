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
                Description = x.Description,
                Id = x.Id, 
                Name = x.Name
            })
            .ToArrayAsync(cancellationToken);
        return Ok(prompts);
    }

    [HttpPost]
    public async Task<ActionResult<PromptsDto>> CreatePrompt([FromBody] PromptsDto request, CancellationToken cancellationToken)
    {
        Prompt prompt = request.ToPrompt(currentUser.Id);
        db.Prompts.Add(prompt);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(request);
    }

    [HttpDelete]
    public async Task<ActionResult> DeletePrompt([FromQuery] Guid id, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == id && x.CreateUserId == currentUser.Id, cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        db.Prompts.Remove(prompt);
        await db.SaveChangesAsync(cancellationToken);
        return Ok();
    }

    [HttpPut]
    public async Task<ActionResult<PromptsDto>> UpdatePrompt([FromBody] PromptsDto request, CancellationToken cancellationToken)
    {
        Prompt? prompt = await db.Prompts.FirstOrDefaultAsync(x => x.Id == request.Id && x.CreateUserId == currentUser.Id, cancellationToken);
        if (prompt == null)
        {
            return NotFound();
        }
        prompt.Content = request.Content;
        prompt.Description = request.Description;
        prompt.Name = request.Name;
        prompt.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(request);
    }
}
