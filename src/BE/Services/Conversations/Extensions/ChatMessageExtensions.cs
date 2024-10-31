using Microsoft.ML.Tokenizers;
using OpenAI.Chat;

namespace Chats.BE.Services.Conversations.Extensions;

public static class ChatMessageExtensions
{
    const int TokenPerMessage = 4;

    public static int CountTokens(this ChatMessage message, Tokenizer tokenizer)
    {
        return TokenPerMessage + message.Content.Sum(p => p.CountTokens(tokenizer));
    }
}