namespace Chats.BE.Controllers.Common.Dtos;

public record PagingRequest(int Page, int PageSize, string? Query);