using Chats.BE.Controllers.Common.Dtos;

namespace Chats.BE.Controllers.Chats.UserChats.Dtos;

public record ChatsQuery(string? GroupId, int Page, int PageSize, string? Query) : PagingRequest(Page, PageSize, Query);
