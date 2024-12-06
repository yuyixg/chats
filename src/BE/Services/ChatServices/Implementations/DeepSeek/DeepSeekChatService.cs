using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Implementations.OpenAI;

namespace Chats.BE.Services.ChatServices.Implementations.DeepSeek;

public class DeepSeekChatService(Model model) : OpenAIChatService(model, new Uri("https://api.deepseek.com/v1"));