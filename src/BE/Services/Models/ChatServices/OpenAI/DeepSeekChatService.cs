using Chats.BE.DB;
using OpenAI.Chat;

namespace Chats.BE.Services.Models.ChatServices.OpenAI;

public class DeepSeekChatService(Model model) : OpenAIChatService(model, new Uri("https://api.deepseek.com/v1"))
{
    protected override Task<ChatMessage[]> FEPreprocess(IReadOnlyList<ChatMessage> messages, ChatCompletionOptions options, ChatExtraDetails feOptions, CancellationToken cancellationToken)
    {
        if (Model.ModelReference.Name == "deepseek-reasoner")
        {
            // deepseek-reasoner model does not support temperature
            options.Temperature = null;
        }
        return base.FEPreprocess(messages, options, feOptions, cancellationToken);
    }
}