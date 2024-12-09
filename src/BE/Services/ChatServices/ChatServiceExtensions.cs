using Chats.BE.Services.ChatServices.Dtos;
using Chats.BE.Services.ChatServices.Extensions;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.ChatServices;

public abstract partial class ChatService
{
    public async IAsyncEnumerable<InternalChatSegment> ChatStreamedFEProcessed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatMessage[] filteredMessage = FEProcessMessages(messages, options);

        await foreach (InternalChatSegment seg in ChatStreamedSimulated(suggestedStreaming: true, filteredMessage, options, cancellationToken))
        {
            yield return seg;
        }
    }

    public async IAsyncEnumerable<InternalChatSegment> ChatStreamedSimulated(bool suggestedStreaming, IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        // notify inputTokenCount first to better support price calculation
        int inputTokens = GetPromptTokenCount(messages);
        int outputTokens = 0;
        yield return InternalChatSegment.InputOnly(inputTokens);

        if (suggestedStreaming && Model.ModelReference.AllowStreaming)
        {
            await foreach (ChatSegment seg in ChatStreamed(messages, options, cancellationToken))
            {
                yield return seg.ToInternal(() => new Dtos.ChatTokenUsage
                {
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens += Tokenizer.CountTokens(seg.TextSegment),
                    ReasoningTokens = 0
                });
            }
        }
        else
        {
            ChatSegment seg = await Chat(messages, options, cancellationToken);
            yield return seg.ToInternal(() => new Dtos.ChatTokenUsage()
            {
                InputTokens = inputTokens,
                OutputTokens = outputTokens += Tokenizer.CountTokens(seg.TextSegment),
                ReasoningTokens = 0
            });
        }
    }

    private ChatMessage[] FEProcessMessages(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options)
    {
        if (!Model.ModelReference.AllowSystemPrompt)
        {
            string systemPrompt = string.Join("\n", messages.OfType<SystemChatMessage>().Select(x => string.Join("\n", x.Content.Where(v => v.Kind == ChatMessageContentPartKind.Text).Select(x => x.Text))));
            UserChatMessage? firstUserMessage = messages.OfType<UserChatMessage>().FirstOrDefault();
            if (firstUserMessage != null)
            {
                firstUserMessage.Content.Insert(0, ChatMessageContentPart.CreateTextPart(systemPrompt + "\n\n"));
                messages = messages.Where(x => x is not SystemChatMessage).ToArray();
            }
            else
            {
                messages = [new UserChatMessage([ChatMessageContentPart.CreateTextPart(systemPrompt)]), .. messages.Where(x => x is not SystemChatMessage)];
            }
        }

        ChatMessage[] filteredMessage = messages.Select(m => FilterVision(Model.ModelReference.AllowVision, m)).ToArray();
        if (Model.ModelReference.AllowVision)
        {
            options.MaxOutputTokenCount ??= Model.ModelReference.MaxResponseTokens;
        }
        if (!Model.ModelReference.AllowSearch)
        {
            options.RemoveAllowSearch();
        }
        options.Temperature = Model.ModelReference.UnnormalizeTemperature(options.Temperature);

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
