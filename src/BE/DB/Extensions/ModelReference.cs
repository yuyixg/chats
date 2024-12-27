namespace Chats.BE.DB;

public partial class ModelReference
{
    public float? UnnormalizeTemperature(float? temperature)
    {
        if (temperature == null) return null;
        return temperature * (float)(MaxTemperature - MinTemperature) + (float)MinTemperature;
    }

    public bool IsSdkUnsupportedO1 => Name == "o1-2024-12-17";
}
