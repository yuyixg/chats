using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class LingYiChatService(Model model) : OpenAIChatService(model, new Uri("https://api.lingyiwanwu.com/v1"));
