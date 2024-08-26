namespace Chats.BE.Services.Common;

internal static class MaskedKeyUtils
{
    public static string ToMasked(this string key)
    {
        return key.Length > 7 ? key[..5] + "****" + key[^2..] : key;
    }

    public static string? ToMaskedNull(this string? key)
    {
        return key is not null && key.Length > 7 ? key[..5] + "****" + key[^2..] : key;
    }

    public static bool SeemsMasked(this string? key)
    {
        return key is not null && key.Length == 11 && key[5..9] == "****";
    }
}
