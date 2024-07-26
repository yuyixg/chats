using Chats.BE.Controllers.Admin.RequestLogs.Dtos;
using Chats.BE.Controllers.Common.Dtos;
using Chats.BE.DB;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Controllers.Admin.RequestLogs;

[Route("api/admin/request-logs"), Authorize(Roles = "admin")]
public class RequestLogsController(ChatsDB db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<PagedResult<RequestLogDto>>> GetRequestLogs([FromBody] PagingRequest pagingRequest, CancellationToken cancellationToken)
    {
        IQueryable<RequestLogDto> query = db.RequestLogs
            .Select(x => new RequestLogDto()
            {
                Id = x.Id,
                Ip = x.Ip,
                Method = x.Method,
                Url = x.Url,
                StatusCode = x.StatusCode,
                Username = x.User!.Username,
                CreatedAt = x.CreatedAt
            })
            .OrderByDescending(x => x.CreatedAt)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(pagingRequest.Query))
        {
            query = query.Where(x => x.Username == pagingRequest.Query);
        }

        return Ok(await PagedResult.FromQuery(query, pagingRequest, cancellationToken));
    }

    [HttpGet]
    public async Task<ActionResult<LogEntry>> GetRequestLogDetails([FromQuery] Guid id, CancellationToken cancellationToken)
    {
        LogEntry? requestLog = await db.RequestLogs
            .Where(x => x.Id == id)
            .Select(x => new LogEntry()
            {
                Id = x.Id,
                Ip = x.Ip,
                Method = x.Method,
                Url = x.Url,
                StatusCode = x.StatusCode,
                User = x.UserId != null ? new OnlyUserName { Username = x.User!.Username } : null,
                CreatedAt = x.CreatedAt,
                Request = x.Request,
                Response = x.Response,
                Headers = x.Headers,
                RequestTime = x.RequestTime,
                ResponseTime = x.ResponseTime,
                UserId = x.UserId,
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (requestLog == null)
        {
            return NotFound();
        }

        return Ok(requestLog);
    }
}
