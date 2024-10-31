using Chats.BE.DB.Jsons;

namespace Chats.BE.DB;

public partial class UserModel2
{
    public bool IsExpired => ExpiresAt < DateTime.UtcNow;

    public JsonTokenBalance ToJsonTokenBalance() => new()
    {
        ModelId = ModelId,
        Counts = CountBalance,
        Expires = ExpiresAt,
        Enabled = !IsDeleted, 
        Tokens = TokenBalance,
    };
}
