using Chats.BE.Services.ChatServices.Dtos;
using Chats.BE.Services.ChatServices.Extensions;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Services.ChatServices;

public abstract partial class ChatService
{
    public async IAsyncEnumerable<InternalChatSegment> ChatStreamedFEProcessed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, ChatExtraDetails feOptions, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        ChatMessage[] filteredMessage = FEPreprocess(messages, options, feOptions);

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

    protected virtual ChatMessage[] FEPreprocess(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, ChatExtraDetails feOptions)
    {
        if (!Model.ModelReference.AllowSystemPrompt)
        {
            // Remove system prompt
            messages = messages.Where(m => m is not SystemChatMessage).ToArray();
        }
        else
        {
            // system message transform
            SystemChatMessage? existingSystemPrompt = messages.OfType<SystemChatMessage>().FirstOrDefault();
            DateTime now = feOptions.Now;
            if (existingSystemPrompt is not null)
            {
                existingSystemPrompt.Content[0] = existingSystemPrompt.Content[0].Text
                    .Replace("{{CURRENT_DATE}}", now.ToString("yyyy/MM/dd"))
                    .Replace("{{MODEL_NAME}}", Model.ModelReference.ShortName ?? Model.ModelReference.Name)
                    .Replace("{{CURRENT_TIME}}", now.ToString("HH:mm:ss"));
                ;
            }
        }

        ChatMessage[] filteredMessage = messages.Select(m => FilterVision(Model.ModelReference.AllowVision, m)).ToArray();
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
