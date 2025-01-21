using Chats.BE.DB;

namespace Chats.BE.Services.Models.ChatServices.OpenAI;

public class LingYiChatService(Model model) : OpenAIChatService(model, new Uri("https://api.lingyiwanwu.com/v1"));
