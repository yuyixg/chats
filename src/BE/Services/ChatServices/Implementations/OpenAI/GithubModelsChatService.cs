using Chats.BE.DB;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class GithubModelsChatService(Model model) : OpenAIChatService(model, new Uri("https://models.inference.ai.azure.com"));