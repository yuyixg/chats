using Chats.BE.DB.Extensions;

namespace Chats.BE.DB;

public partial class ChatModel
{
    public ModelIdentifier ToIdentifier() => new(ModelProvider, ModelVersion);
}