using Chats.BE.DB;

namespace Chats.BE.Services.Models;

public abstract class ModelLoader
{
    public abstract Task<string[]> ListModels(ModelKey modelKey, CancellationToken cancellationToken);
}
