using System.ComponentModel.DataAnnotations;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record CreateChatSpanRequest
{
    public short? ModelId { get; init; }
    public bool SetTemperature { get; init; } = false;
    public float? Temperature { get; init; }
    public bool? EnableSearch { get; init; }
}