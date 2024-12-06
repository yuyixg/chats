using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Implementations.OpenAI;

namespace Chats.BE.Services.ChatServices.Implementations.GLM;

public class GLMChatService(Model model) : OpenAIChatService(model, new Uri("https://open.bigmodel.cn/api/paas/v4/"))
{
}
