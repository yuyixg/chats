namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public enum SseResponseKind
{
    StopId = 0,
    Segment = 1,
    Error = 2,
    PostMessage = 3,
    UpdateTitle = 4,
    TitleSegment = 5,
}