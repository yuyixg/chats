using Chats.BE.DB.Converter;
using Microsoft.EntityFrameworkCore;

namespace Chats.BE.DB;

public partial class ChatsDB
{
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<DateTime>().HaveConversion<DateTimeAsUtcValueConverter>();
        configurationBuilder.Properties<DateTime?>().HaveConversion<NullableDateTimeAsUtcValueConverter>();
    }
}
