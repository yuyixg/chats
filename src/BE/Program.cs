using Chats.BE.DB;
using Chats.BE.Infrastructure;
using Chats.BE.Services;
using Chats.BE.Services.Configs;
using Chats.BE.Services.Conversations;
using Chats.BE.Services.IdEncryption;
using Chats.BE.Services.OpenAIApiKeySession;
using Chats.BE.Services.Sessions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace Chats.BE;

public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers(options =>
        {
            options.CacheProfiles.Add("ModelInfo", new CacheProfile()
            {
                Duration = 5 * 60,
                Location = ResponseCacheLocation.Client,
            });
        });
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddDbContext<ChatsDB>(o =>
        {
            if (builder.Environment.IsDevelopment()) { o.EnableSensitiveDataLogging(); }
        });
        builder.Services.AddHttpClient();
        builder.Services.AddSingleton<AppConfigService>();
        builder.Services.AddSingleton<PasswordHasher>();
        builder.Services.AddScoped<CurrentUser>();
        builder.Services.AddScoped<CurrentApiKey>();
        builder.Services.AddSingleton<CsrfTokenService>();
        builder.Services.AddScoped<GlobalDBConfig>();
        builder.Services.AddScoped<UserManager>();
        builder.Services.AddSingleton<SessionCache>();
        builder.Services.AddScoped<SessionManager>();
        builder.Services.AddScoped<UserModelManager>();
        builder.Services.AddSingleton<OpenAIApiKeySessionCache>();
        builder.Services.AddScoped<OpenAIApiKeySessionManager>();
        builder.Services.AddScoped<HostUrlService>();
        builder.Services.AddSingleton<ConversationFactory>();
        builder.Services.AddSingleton<BalanceService>();
        builder.Services.AddScoped<ClientInfoManager>();
        builder.Services.AddIdEncryption();
        builder.Services.AddHttpContextAccessor();

        // Add authentication and configure the default scheme
        builder.Services.AddAuthentication("SessionId")
            .AddScheme<AuthenticationSchemeOptions, SessionAuthenticationHandler>("SessionId", null)
            .AddScheme<AuthenticationSchemeOptions, OpenAIApiKeyAuthenticationHandler>("OpenAIApiKey", null);

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
        app.UseMiddleware<FrontendMiddleware>();
        app.UseStaticFiles();
        app.Run();
    }
}
