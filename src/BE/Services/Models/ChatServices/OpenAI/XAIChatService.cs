using Chats.BE.DB;

namespace Chats.BE.Services.Models.ChatServices.OpenAI;

public class XAIChatService(Model model) : OpenAIChatService(model, new Uri("https://api.x.ai/v1"));