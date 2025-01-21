using Chats.BE.DB;
using OpenAI;
using OpenAI.Models;
using System.ClientModel;

namespace Chats.BE.Services.Models.ModelLoaders;

public class OpenAIModelLoader : ModelLoader
{
    public override async Task<string[]> ListModels(ModelKey modelKey, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(modelKey.Secret, nameof(modelKey.Secret));

        OpenAIClient api = new(new ApiKeyCredential(modelKey.Secret), new OpenAIClientOptions()
        {
            Endpoint = !string.IsNullOrWhiteSpace(modelKey.Host) ? new Uri(modelKey.Host) : null,
        });
        ClientResult<OpenAIModelCollection> result = await api.GetOpenAIModelClient().GetModelsAsync(cancellationToken);
        return result.Value.Select(m => m.Id).ToArray();
    }
}
