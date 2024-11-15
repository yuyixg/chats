﻿using Chats.BE.Services.Conversations.Dtos;
using OpenAI.Chat;
using OpenAI;
using System.Runtime.CompilerServices;
using System.ClientModel;
using Chats.BE.DB;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;

namespace Chats.BE.Services.Conversations.Implementations.OpenAI;

public partial class OpenAIConversationService : ConversationService
{
    private readonly ChatClient _chatClient;

    public OpenAIConversationService(Model model, Uri? enforcedApiHost = null) : base(model)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(model.ModelKey.Secret, nameof(model.ModelKey.Secret));

        OpenAIClient api = new(new ApiKeyCredential(model.ModelKey.Secret!), new OpenAIClientOptions()
        {
            Endpoint = enforcedApiHost ?? (!string.IsNullOrWhiteSpace(model.ModelKey.Host) ? new Uri(model.ModelKey.Host) : null),
        });
        _chatClient = api.GetChatClient(model.ApiModelId);
    }

    public OpenAIConversationService(Model model, ChatClient chatClient) : base(model)
    {
        _chatClient = chatClient;
    }

    public override async IAsyncEnumerable<ChatSegment> ChatStreamed(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (StreamingChatCompletionUpdate delta in _chatClient.CompleteChatStreamingAsync(messages, options, cancellationToken))
        {
            if (delta.ContentUpdate.Count == 0) continue;

            yield return new ChatSegment
            {
                TextSegment = delta.ContentUpdate[0].Text,
                FinishReason = delta.FinishReason,
                Usage = delta.Usage != null ? new Dtos.ChatTokenUsage()
                {
                    InputTokens = delta.Usage.InputTokenCount,
                    OutputTokens = delta.Usage.OutputTokenCount,
                    ReasoningTokens = delta.Usage.OutputTokenDetails?.ReasoningTokenCount ?? 0,
                } : null,
            };
        }
    }

    public override async Task<ChatSegment> Chat(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, CancellationToken cancellationToken)
    {
        ClientResult<ChatCompletion> cc = await _chatClient.CompleteChatAsync(messages, options, cancellationToken);
        ChatCompletion delta = cc.Value;
        return new ChatSegment
        {
            TextSegment = delta.Content[0].Text,
            FinishReason = delta.FinishReason,
            Usage = delta.Usage != null ? new Dtos.ChatTokenUsage()
            {
                InputTokens = delta.Usage.InputTokenCount,
                OutputTokens = delta.Usage.OutputTokenCount,
                ReasoningTokens = delta.Usage.OutputTokenDetails?.ReasoningTokenCount ?? 0,
            } : null,
        };
    }
}
