using Chats.BE.Controllers.Admin.FileServices.Dtos;
using Chats.BE.DB;
using Chats.BE.DB.Jsons;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Chats.BE.Controllers.Admin.FileServices;

[Route("api/admin/file-service")]
public class FileServiceController(ChatsDB db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<FileServiceSimpleDto[]>> ListFileServices(bool select, CancellationToken cancellationToken)
    {
        if (select)
        {
            // simple mode, only return enabled id and name
            FileServiceSimpleDto[] data = await db.FileServices
                .Where(x => x.Enabled)
                .Select(x => new FileServiceSimpleDto
                {
                    Id = x.Id,
                    Name = x.Name,
                })
                .ToArrayAsync(cancellationToken);
            return Ok(data);
        }
        else
        {
            // full mode, return all fields
            FileServiceDto[] data = db.FileServices
                .Select(x => new FileServiceDtoTemp
                {
                    Id = x.Id,
                    Name = x.Name,
                    Type = x.Type,
                    Configs = x.Configs,
                    Enabled = x.Enabled,
                    CreatedAt = x.CreatedAt,
                })
                .AsEnumerable()
                .Select(x => x.ToDto().WithMaskedKeys())
                .ToArray();
            return Ok(data);
        }
    }

    [HttpPut]
    public async Task<ActionResult> UpdateFileService([FromBody] FileServiceUpdateRequest req, CancellationToken cancellationToken)
    {
        FileService? existingData = await db.FileServices.FindAsync([req.Id], cancellationToken);
        if (existingData == null)
        {
            return NotFound();
        }

        req.ApplyTo(existingData);
        if (db.ChangeTracker.HasChanges())
        {
            existingData.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }
}
