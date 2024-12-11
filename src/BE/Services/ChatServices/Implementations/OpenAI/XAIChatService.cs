using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class XAIChatService(Model model) : OpenAIChatService(model, new Uri("https://api.x.ai/v1"));