using Microsoft.ML.Tokenizers;
using OpenAI.Chat;

namespace Chats.BE.Services.Conversations.Extensions;

public static class ChatMessageContentPartExtensions
{
    public static int CountTokens(this ChatMessageContentPart part, Tokenizer tokenizer)
    {
        return part.Kind switch
        {
            ChatMessageContentPartKind.Text => Tokenizer.CountTokens(c.Text),
            // https://platform.openai.com/docs/guides/vision/calculating-costs
            // assume image is ~2048x4096 in detail: high, mosts 1105 tokens
            ChatMessageContentPartKind.Image => 1105,
            ChatMessageContentPartKind.Refusal => 0,
            _ => throw new NotSupportedException(part.Kind.ToString()),
        };
    }
}
