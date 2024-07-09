namespace Chats.BE.Services.Sessions;

public record SessionEntry
{
    public required Guid UserId { get; init; }
    public required string UserName { get; init; }
    public required string Role { get; init; }
    public required string? Provider { get; init; }
    public required string? Sub { get; init; }
}
