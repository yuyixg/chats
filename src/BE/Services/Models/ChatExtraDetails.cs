namespace Chats.BE.Services.Models;

public record ChatExtraDetails
{
    public required short TimezoneOffset { get; init; }

    public DateTime Now => DateTime.UtcNow.AddMinutes(TimezoneOffset);

    public static ChatExtraDetails Default => new()
    {
        TimezoneOffset = 0
    };
}
