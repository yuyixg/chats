using OpenAI.Chat;
using System.ClientModel.Primitives;
using System.Text.Json;
using System.Reflection;

namespace Chats.BE.Controllers.Chats.OpenAICompatible;

internal class ChatMessageHelper
{
    public delegate ChatMessage DeserializeChatMessageDelegate(JsonElement element, ModelReaderWriterOptions? options = null);
    public static DeserializeChatMessageDelegate DeserializeChatMessage { get; }

    static ChatMessageHelper()
    {
        DeserializeChatMessage = (typeof(ChatMessage).GetMethod(nameof(DeserializeChatMessage), BindingFlags.NonPublic | BindingFlags.Static) ?? throw new InvalidOperationException("DeserializeChatMessage method not found"))
            .CreateDelegate<DeserializeChatMessageDelegate>();
    }
}