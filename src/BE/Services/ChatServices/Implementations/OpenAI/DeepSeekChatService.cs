using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class DeepSeekChatService(Model model) : OpenAIChatService(model, new Uri("https://api.deepseek.com/v1"));