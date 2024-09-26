
namespace Chats.BE.Services.IdEncryption;

public static class IdEncryptionFactoryExtensions
{
    public static IServiceCollection AddIdEncryption(this IServiceCollection services)
    {
        services.AddSingleton<IdEncryptionFactory>(); // 注册工厂本身
        services.AddTransient(serviceProvider =>
        {
            IdEncryptionFactory factory = serviceProvider.GetRequiredService<IdEncryptionFactory>();
            return factory.Create();
        });

        return services;
    }
}