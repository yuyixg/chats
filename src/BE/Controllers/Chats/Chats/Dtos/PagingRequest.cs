namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record PagingRequest(int Page, int PageSize, string? Query);