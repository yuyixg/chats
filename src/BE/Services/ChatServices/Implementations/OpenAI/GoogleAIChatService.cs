using Chats.BE.DB;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class GoogleAIChatService(Model model) : OpenAIChatService(model, new Uri("https://generativelanguage.googleapis.com/v1beta/openai/"))
{
    protected override bool SupportsVisionLink => false;
}