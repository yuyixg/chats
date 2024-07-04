
using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Microsoft.AspNetCore.Authentication;

namespace Chats.BE;

public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddDbContext<ChatsDB>();
        builder.Services.AddHttpClient();
        builder.Services.AddSingleton<AppConfigService>();
        builder.Services.AddSingleton<PasswordHasher>();
        builder.Services.AddScoped<CurrentUser>();
        builder.Services.AddSingleton<CsrfTokenService>();
        builder.Services.AddHttpContextAccessor();

        // Add authentication and configure the default scheme
        builder.Services.AddAuthentication("Bearer")
            .AddScheme<AuthenticationSchemeOptions, SessionAuthenticationHandler>("Bearer", null);

        builder.AddReverseProxy();

        builder.AddCORSPolicies();

        WebApplication app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCORSMiddleware();

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        // Use the reverse proxy middleware
        app.MapReverseProxy();

        app.Run();
    }
}
