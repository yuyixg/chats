using Microsoft.EntityFrameworkCore.Design;

namespace Chats.BE.DB.Design;

public class CustomPluralizer : IPluralizer
{
    public string Pluralize(string name)
    {
        // 可以加入更多的逻辑来判断其他单词
        if (name == "Sms")
            return "Sms";

        // 可以使用任何现有库，如 Humanizer 来处理其他名称
        return Humanizer.InflectorExtensions.Pluralize(name) ?? name;
    }

    public string Singularize(string name)
    {
        if (name == "Sms")
            return "Sms";

        // 同上，使用 Humanizer 或您选择的其他库来处理
        return Humanizer.InflectorExtensions.Singularize(name) ?? name;
    }
}
