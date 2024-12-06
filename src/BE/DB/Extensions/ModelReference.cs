namespace Chats.BE.DB;

public partial class ModelReference
{
    public float? UnnormalizeTemperature(float? temperature)
    {
        if (temperature == null) return null;
        return temperature * (float)(MaxTemperature - MinTemperature) + (float)MinTemperature;
    }
}
