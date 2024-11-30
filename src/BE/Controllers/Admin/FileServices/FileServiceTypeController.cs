using Chats.BE.Controllers.Admin.Common;
using Chats.BE.DB;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Admin.FileServices;

[Route("api/admin/file-service-type"), AuthorizeAdmin]
public class FileServiceTypeController(ChatsDB db) : ControllerBase
{
    [HttpGet("{fileServiceTypeId:int}/initial-config")]
    public async Task<ActionResult<string>> GetFileServiceTypeInitialConfig(int fileServiceTypeId, CancellationToken cancellationToken)
    {
        FileServiceType? fileServiceType = await db.FileServiceTypes.FindAsync([fileServiceTypeId], cancellationToken);
        if (fileServiceType == null)
        {
            return NotFound();
        }

        return Ok(fileServiceType.InitialConfig);
    }
}