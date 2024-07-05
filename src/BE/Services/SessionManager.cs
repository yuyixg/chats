using Chats.BE.DB;
using Microsoft.EntityFrameworkCore;
using System.Threading;

namespace Chats.BE.Services;

public class SessionManager(ChatsDB db)
{
    public async Task<Guid> RefreshUserSessionId(Guid userId, CancellationToken cancellationToken)
    {
        await db.Sessions.Where(x => x.UserId == userId).ExecuteDeleteAsync(cancellationToken);
        Session session = new()
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
        };
        db.Sessions.Add(session);
        db.SaveChanges();

        return session.Id;
    }
}
