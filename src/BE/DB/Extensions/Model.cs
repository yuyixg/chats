using Chats.BE.DB.Jsons;

namespace Chats.BE.DB;

public partial class Model
{
    public JsonPriceConfig ToPriceConfig() => new()
    {
        InputTokenPrice = InputTokenPrice1M / 100_0000,
        OutputTokenPrice = OutputTokenPrice1M / 100_0000
    };

    public string ApiModelId
    {
        get => DeploymentName ?? ModelReference.Name;
    }
}