using Microsoft.EntityFrameworkCore;

namespace Chats.BE.Services.Init;

public static class DBConfigure
{
    public static void Configure(this DbContextOptionsBuilder dbContextOptionsBuilder, IConfiguration configuration, IWebHostEnvironment environment)
    {
        string? dbType = configuration["DBType"];
        string connectionString = "Name=ConnectionStrings:ChatsDB";
        if (dbType == null || dbType.Equals("sqlite", StringComparison.OrdinalIgnoreCase))
        {
            dbContextOptionsBuilder.UseSqlite(connectionString);
        }
        else if (dbType.Equals("sqlserver", StringComparison.OrdinalIgnoreCase) || dbType.Equals("mssql", StringComparison.OrdinalIgnoreCase))
        {
            dbContextOptionsBuilder.UseSqlServer(connectionString);
        }
        else if (dbType.Equals("postgresql", StringComparison.OrdinalIgnoreCase) || dbType.Equals("pgsql", StringComparison.OrdinalIgnoreCase))
        {
            dbContextOptionsBuilder.UseNpgsql(connectionString);
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
