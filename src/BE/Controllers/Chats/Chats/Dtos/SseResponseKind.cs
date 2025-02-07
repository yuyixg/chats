namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public enum SseResponseKind
{
    End = -1,
    StopId = 0,
    Segment = 1,
    Error = 2,
    UserMessage = 3,
    UpdateTitle = 4,
    TitleSegment = 5,
    ResponseMessage = 6,
    ChatLeafMessageId = 7,
    ThinkSegment = 8,
}