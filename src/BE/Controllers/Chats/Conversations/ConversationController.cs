using Chats.BE.Controllers.Chats.Conversations.Dtos;
using Chats.BE.Services.Conversations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE.Controllers.Chats.Conversations;

[Route("api/chats2"), Authorize]
public class ConversationController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> StartConversationStreamed(
        [FromBody] ConversationRequest request, 
        [FromServices] ConversationFactory conversationFactory, 
        CancellationToken cancellationToken)
    {
        ConversationService s = conversationFactory.CreateConversationService(request.ModelId, request.UserModelConfig);
        throw new NotImplementedException();
    }
}
