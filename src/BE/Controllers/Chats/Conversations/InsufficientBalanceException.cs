using Chats.BE.Controllers.OpenAICompatible.Dtos;

namespace Chats.BE.Controllers.Chats.Conversations;

public abstract class ChatServiceException(OpenAICompatibleErrorCode errorCode) : Exception
{
    public OpenAICompatibleErrorCode ErrorCode => errorCode;

    public override string Message => $"code: {ErrorCode}";
}

public class InsufficientBalanceException() : ChatServiceException(OpenAICompatibleErrorCode.InsufficientBalance)
{
    public override string Message => "Insufficient balance";
}

public class InvalidModelException(string modelName) : ChatServiceException(OpenAICompatibleErrorCode.InvalidModel)
{
    public string ModelName => modelName;

    public override string Message => "The Model does not exist or access is denied.";
}

public class SubscriptionExpiredException(DateTime expiresAt) : ChatServiceException(OpenAICompatibleErrorCode.SubscriptionExpired)
{
    public DateTime ExpiresAt => expiresAt;

    public override string Message => "Subscription has expired";
}