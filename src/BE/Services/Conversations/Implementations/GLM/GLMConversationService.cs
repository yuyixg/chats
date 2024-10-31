using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.OpenAI;

namespace Chats.BE.Services.Conversations.Implementations.GLM;

public class GLMConversationService(Model model) : OpenAIConversationService(model, new Uri("https://open.bigmodel.cn/api/paas/v4/"))
{
}
