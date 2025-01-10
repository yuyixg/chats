using Chats.BE.DB;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.ChatServices.Implementations.OpenAI;

public class GoogleAIChatService(Model model) : OpenAIChatService(model, new Uri("https://generativelanguage.googleapis.com/v1beta/openai/"))
{
    protected override Dtos.ChatTokenUsage GetUsage(ChatTokenUsage usage)
    {
        IDictionary<string, BinaryData> b = GetSerializedAdditionalRawData(usage)!;
        return new Dtos.ChatTokenUsage
        {
            InputTokens = b["promptTokens"].ToObjectFromJson<int>(),
            OutputTokens = b["completionTokens"].ToObjectFromJson<int>(),
            ReasoningTokens = 0,
        };
    }

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "get_SerializedAdditionalRawData")]
    private extern static IDictionary<string, BinaryData>? GetSerializedAdditionalRawData(ChatTokenUsage usage);
}