using Chats.BE.DB;
using Chats.BE.Services.Conversations.Implementations.OpenAI;

namespace Chats.BE.Services.Conversations.Implementations.Kimi;

public class KimiConversationService(Model model) : OpenAIConversationService(model, new Uri("https://api.moonshot.cn/v1"));