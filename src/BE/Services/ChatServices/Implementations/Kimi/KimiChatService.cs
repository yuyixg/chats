using Chats.BE.DB;
using Chats.BE.Services.ChatServices.Implementations.OpenAI;

namespace Chats.BE.Services.ChatServices.Implementations.Kimi;

public class KimiChatService(Model model) : OpenAIChatService(model, new Uri("https://api.moonshot.cn/v1"));