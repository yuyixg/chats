using Chats.BE.Services.Conversations.Dtos;
using Chats.BE.Services.Conversations.Extensions;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.Conversations;

internal static class ConversationServiceExtensions
{
    public static IAsyncEnumerable<ConversationSegment> ChatStreamedFEProcessed(this ConversationService cs, IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        ChatMessage[] filteredMessage = FEProcessMessages(cs, messages, options);
        return ChatStreamedSimulated(cs, filteredMessage, options, cancellationToken);
    }

    public static async IAsyncEnumerable<ConversationSegment> ChatStreamedSimulated(this ConversationService cs, IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (cs.Model.ModelReference.AllowStreaming)
        {
            await foreach (ConversationSegment seg in cs.ChatStreamed(messages, options, cancellationToken))
            {
                yield return seg;
            }
        }
        else
        {
            yield return await cs.Chat(messages, options, cancellationToken);
        }
    }

    private static ChatMessage[] FEProcessMessages(ConversationService cs, IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options)
    {
        if (!cs.Model.ModelReference.AllowSystemPrompt)
        {
            string systemPrompt = string.Join("\n", messages.OfType<SystemChatMessage>().Select(x => string.Join("\n", x.Content.Where(v => v.Kind == ChatMessageContentPartKind.Text).Select(x => x.Text))));
            UserChatMessage? firstUserMessage = messages.OfType<UserChatMessage>().FirstOrDefault();
            if (firstUserMessage != null)
            {
                firstUserMessage.Content.Insert(0, ChatMessageContentPart.CreateTextPart(systemPrompt));
                messages = messages.Where(x => x is not SystemChatMessage).ToArray();
            }
            else
            {
                messages = [new UserChatMessage([ChatMessageContentPart.CreateTextPart(systemPrompt + "\n")]), .. messages.Where(x => x is not SystemChatMessage)];
            }
        }

        ChatMessage[] filteredMessage = messages.Select(m => FilterVision(cs.Model.ModelReference.AllowVision, m)).ToArray();
        if (cs.Model.ModelReference.AllowVision)
        {
            options.MaxOutputTokenCount ??= cs.Model.ModelReference.MaxResponseTokens;
        }
        if (!cs.Model.ModelReference.AllowSearch)
        {
            options.RemoveAllowSearch();
        }

        return filteredMessage;
    }

    private static ChatMessage FilterVision(bool allowVision, ChatMessage message)
    {
        if (!allowVision)
        {
            return ReplaceUserMessageImageIntoLinkText(message);
        }
        else
        {
            return message;
        }

        static ChatMessage ReplaceUserMessageImageIntoLinkText(ChatMessage message)
        {
            return message switch
            {
                UserChatMessage userChatMessage => new UserChatMessage(userChatMessage.Content.Select(c => c.Kind switch
                {
                    var x when x == ChatMessageContentPartKind.Image => ChatMessageContentPart.CreateTextPart(c.ImageUri.ToString()),
                    _ => c,
                })),
                _ => message,
            };
        }
    }
}
