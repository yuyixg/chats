namespace Chats.BE.Infrastructure;

internal static class CORS
{
    public static void AddCORSPolicies(this WebApplicationBuilder builder)
    {
        string frontendUrl = builder.Configuration.GetValue<string>("FE_URL") ?? throw new ArgumentNullException("FE_URL is required in the configuration");

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("FrontendCORS", policy =>
            {
                policy.WithOrigins(frontendUrl)
                      .AllowAnyMethod()
                      .AllowAnyHeader()
                      .AllowCredentials()
                      .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
            });
        });
    }

    public static void UseCORSMiddleware(this WebApplication app)
    {
        string frontendUrl = app.Configuration.GetValue<string>("FE_URL") ?? throw new ArgumentNullException("FE_URL is required in the configuration");

        // Handle OPTIONS requests before CORS middleware
        app.Use(async (context, next) =>
        {
            if (context.Request.Method == "OPTIONS" && context.Request.Headers["Origin"] == frontendUrl)
            {
                context.Response.StatusCode = 204; // No Content
                return;
            }

            await next.Invoke();
        });
        app.UseCors("FrontendCORS");
    }
}
