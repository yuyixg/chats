using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Implementations.OpenAI;

namespace Chats.BE.Services.ChatServices.Implementations.LingYi;

public class LingYiChatService(Model model) : OpenAIChatService(model, new Uri("https://api.lingyiwanwu.com/v1"));
