using Chats.BE.DB;

namespace Chats.BE.Services.Models.ChatServices.OpenAI;

public class SiliconFlowChatService(Model model) : OpenAIChatService(model, new Uri("https://api.siliconflow.cn/v1"));