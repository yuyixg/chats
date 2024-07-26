using Microsoft.EntityFrameworkCore.Design;

namespace Chats.BE.DB.Design;

public class CustomDesignTimeServices : IDesignTimeServices
{
    public void ConfigureDesignTimeServices(IServiceCollection services)
    {
        services.AddSingleton<IPluralizer, CustomPluralizer>();
    }
}