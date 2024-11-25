using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.Init;

public static class DBConfigure
{
    public static void Configure(this DbContextOptionsBuilder dbContextOptionsBuilder, IConfiguration configuration, IWebHostEnvironment environment)
    {
        string? dbType = configuration["DBType"];
        if (dbType == "sqlite" || dbType == null)
        {
            dbContextOptionsBuilder.UseSqlite("Name=ConnectionStrings:ChatsDB");
        }
        else if (dbType == "sqlserver")
        {
            dbContextOptionsBuilder.UseSqlite("Name=ConnectionStrings:ChatsDB");
        }
        else
        {
            throw new Exception("Unknown DBType: " + dbType);
        }

        if (environment.IsDevelopment())
        {
            dbContextOptionsBuilder.EnableSensitiveDataLogging();
        }
    }
}
