using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class KimiChatService(Model model) : OpenAIChatService(model, new Uri("https://api.moonshot.cn/v1"));