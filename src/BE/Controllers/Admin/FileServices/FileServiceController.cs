﻿using Chats.BE.Controllers.Admin.FileServices.Dtos;
using Chats.BE.Controllers.Common;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [HttpPut("{fileServiceId}")]
    public async Task<ActionResult> UpdateFileService(Guid fileServiceId, [FromBody] FileServiceUpdateRequest req, CancellationToken cancellationToken)
    {
        FileService? existingData = await db.FileServices.FindAsync([fileServiceId], cancellationToken);
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

    [HttpPost]
    public async Task CreateFileService([FromBody] FileServiceUpdateRequest req, CancellationToken cancellationToken)
    {
        db.FileServices.Add(new FileService
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Type = req.Type,
            Enabled = req.Enabled,
            Configs = req.Configs,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }

    [HttpDelete("{fileServiceId}")]
    public async Task<ActionResult> DeleteFileService(Guid fileServiceId, CancellationToken cancellationToken)
    {
        if (await db.ChatModels
            .Where(x => x.FileServiceId == fileServiceId)
            .AnyAsync(cancellationToken))
        {
            return this.BadRequestMessage("Cannot delete file service that is being used by chat models");
        }

        FileService? existingData = await db.FileServices.FindAsync([fileServiceId], cancellationToken);
        if (existingData == null)
        {
            return NotFound();
        }

        db.FileServices.Remove(existingData);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
