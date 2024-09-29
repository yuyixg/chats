namespace Chats.BE.Controllers.Chats.OpenAICompatible.Dtos;

public enum OpenAICompatibleErrorCode
{
    Unknown = 4000,
    InsufficientBalance = 4001, 
    UpstreamError = 4002,
    InvalidModel = 4003,
    SubscriptionExpired = 4004,
}
