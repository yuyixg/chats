using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations.Extensions;

public static class ChatCompletionOptionsExtensions
{
    public static bool IsSearchEnabled(this ChatCompletionOptions options)
    {
        Dictionary<string, BinaryData> rawData = GetSerializedAdditionalRawData(options);
        if (rawData.TryGetValue("enable_search", out BinaryData? binaryData))
        {
            return binaryData.ToObjectFromJson<bool>();
        }
        return false;
    }

    public static void SetSearchEnabled(this ChatCompletionOptions options, bool value)
    {
        Dictionary<string, BinaryData> rawData = GetSerializedAdditionalRawData(options);
        rawData["enable_search"] = BinaryData.FromObjectAsJson(value);
    }

    public static void RemoveAllowSearch(this ChatCompletionOptions options)
    {
        Dictionary<string, BinaryData> rawData = GetSerializedAdditionalRawData(options);
        rawData.Remove("enable_search");
    }

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "get_SerializedAdditionalRawData")]
    private extern static Dictionary<string, BinaryData> GetSerializedAdditionalRawData(ChatCompletionOptions @this);
}
