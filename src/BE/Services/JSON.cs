using System.Text.Encodings.Web;
using System.Text.Json;

namespace Chats.BE.Services;

public static class JSON
{
    public static JsonSerializerOptions JsonSerializerOptions { get; } = new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    public static string Serialize<T>(T obj)
    {
        return JsonSerializer.Serialize(obj, JsonSerializerOptions);
    }
}
