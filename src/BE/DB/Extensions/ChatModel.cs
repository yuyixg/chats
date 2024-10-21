using Chats.BE.DB.Extensions;
using Chats.BE.DB.Jsons;

namespace Chats.BE.DB;

public partial class Model
{
    public ModelIdentifier ToIdentifier() => new(ModelProvider, ModelVersion);

    public JsonPriceConfig ToPriceConfig() => new()
    {
        InputTokenPrice = PromptTokenPrice1M / 100_0000,
        OutputTokenPrice = ResponseTokenPrice1M / 100_0000
    };
}