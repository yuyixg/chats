namespace Chats.BE.DB;

public partial class UserModel2
{
    public bool IsExpired => ExpiresAt < DateTime.UtcNow;
}
