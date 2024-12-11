using OpenAI.Chat;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.ChatServices.Extensions;

public static class ChatCompletionOptionsExtensions
{
    public static bool IsSearchEnabled(this ChatCompletionOptions options)
    {
        IDictionary<string, BinaryData>? rawData = GetSerializedAdditionalRawData(options);
        if (rawData != null && rawData.TryGetValue("enable_search", out BinaryData? binaryData))
        {
            return binaryData.ToObjectFromJson<bool>();
        }
        return false;
    }

    public static void SetAllowSearch(this ChatCompletionOptions options, bool value)
    {
        IDictionary<string, BinaryData>? rawData = GetSerializedAdditionalRawData(options);
        if (rawData == null)
        {
            rawData = new Dictionary<string, BinaryData>();
            SetSerializedAdditionalRawData(options, rawData);
        }

        rawData["enable_search"] = BinaryData.FromObjectAsJson(value);
    }

    public static void RemoveAllowSearch(this ChatCompletionOptions options)
    {
        IDictionary<string, BinaryData>? rawData = GetSerializedAdditionalRawData(options);
        rawData?.Remove("enable_search");
    }

    public static void SetModelName(this ChatCompletionOptions @this, string name)
    {
        Type internalCreateChatCompletionRequestModelType = typeof(ChatCompletionOptions).Assembly.GetType("OpenAI.Chat.InternalCreateChatCompletionRequestModel")
            ?? throw new InvalidOperationException("InternalCreateChatCompletionRequestModel type not found");
        object modelValue = Activator.CreateInstance(internalCreateChatCompletionRequestModelType, [name])
            ?? throw new InvalidOperationException("Failed to create instance of InternalCreateChatCompletionRequestModel");
        (typeof(ChatCompletionOptions).GetProperty("Model", BindingFlags.Instance | BindingFlags.NonPublic) ?? throw new InvalidOperationException("Model property not found"))
            .SetValue(@this, modelValue);
    }

    public static ulong? GetDashScopeSeed(this ChatCompletionOptions options)
    {
        IDictionary<string, BinaryData>? rawData = GetSerializedAdditionalRawData(options);
        if (rawData != null && rawData.TryGetValue("seed", out BinaryData? binaryData))
        {
            return binaryData.ToObjectFromJson<ulong>();
        }
        return null;
    }

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "get_SerializedAdditionalRawData")]
    private extern static IDictionary<string, BinaryData>? GetSerializedAdditionalRawData(ChatCompletionOptions @this);

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "set_SerializedAdditionalRawData")]
    private extern static void SetSerializedAdditionalRawData(ChatCompletionOptions @this, IDictionary<string, BinaryData>? value);
}
