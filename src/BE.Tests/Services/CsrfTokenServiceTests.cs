using Chats.BE.Services;
using Chats.BE.Tests.Common;

namespace Chats.BE.Tests.Services;

public class CsrfTokenServiceTests
{
    [Fact]
    public void Constructor_SigningKeyNotSet_GeneratesNewKeyAndLogsWarning()
    {
        // Arrange
        var config = new DictionaryConfiguration([]);
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);

        // Act
        var service = new CsrfTokenService(config, logger, timeProvider);

        // Assert
        var logs = logger.GetLogs();
        Assert.Contains("No SigningKey found in configuration", logs);
        Assert.Equal(32, GetPrivateField<byte[]>(service, "_key").Length);
    }

    [Fact]
    public void Constructor_SigningKeySet_ThrowsIfIncorrectLength()
    {
        // Arrange
        var config = new DictionaryConfiguration(new Dictionary<string, string>
            {
                { "SigningKey", "TooShort" }
            });
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => new CsrfTokenService(config, logger, timeProvider));
    }

    [Fact]
    public void GenerateToken_CreatesValidToken()
    {
        // Arrange
        var config = new DictionaryConfiguration(new Dictionary<string, string>
            {
                { "SigningKey", "0UrY1tx6Z6GAQKX/xsC1xjQ3uaMHaEs3cRf8kwgEz+Q=" } // This should be a 32-byte base64 encoded key
            });
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);
        var service = new CsrfTokenService(config, logger, timeProvider);

        // Act
        var token = service.GenerateToken();

        // Assert
        Assert.NotNull(token);
        var tokenBytes = Convert.FromBase64String(token);
        Assert.Equal(40, tokenBytes.Length); // 8 bytes timestamp + 32 bytes hash
    }

    [Fact]
    public void VerifyToken_ValidToken_ReturnsTrue()
    {
        // Arrange
        var config = new DictionaryConfiguration(new Dictionary<string, string>
            {
                { "SigningKey", "0UrY1tx6Z6GAQKX/xsC1xjQ3uaMHaEs3cRf8kwgEz+Q=" }
            });
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);
        var service = new CsrfTokenService(config, logger, timeProvider);
        var token = service.GenerateToken();

        // Act
        var result = service.VerifyToken(token);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void VerifyToken_InvalidToken_ReturnsFalse()
    {
        // Arrange
        var config = new DictionaryConfiguration(new Dictionary<string, string>
            {
                { "SigningKey", "0UrY1tx6Z6GAQKX/xsC1xjQ3uaMHaEs3cRf8kwgEz+Q=" }
            });
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);
        var service = new CsrfTokenService(config, logger, timeProvider);
        var token = service.GenerateToken(); // A valid token

        // Act
        var invalidToken = token + "Invalid"; // Making it invalid
        var result = service.VerifyToken(invalidToken);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void VerifyToken_ExpiredToken_ReturnsFalse()
    {
        // Arrange
        var config = new DictionaryConfiguration(new Dictionary<string, string>
            {
                { "SigningKey", "0UrY1tx6Z6GAQKX/xsC1xjQ3uaMHaEs3cRf8kwgEz+Q=" }
            });
        var logger = new StringLogger<CsrfTokenService>();
        var timeProvider = new FixedTimeProvider(DateTimeOffset.UtcNow);
        var service = new CsrfTokenService(config, logger, timeProvider);
        var token = service.GenerateToken();

        // Simulate expiration by advancing the clock
        timeProvider.SetTime(timeProvider.GetUtcNow() + TimeSpan.FromMinutes(5) + TimeSpan.FromSeconds(1));

        // Act
        var result = service.VerifyToken(token);

        // Assert
        Assert.False(result);
    }

    private static T GetPrivateField<T>(object obj, string fieldName)
    {
        var field = obj.GetType().GetField(fieldName, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (field == null)
            throw new ArgumentException($"Field '{fieldName}' not found in type '{obj.GetType()}'");
        return (T)field.GetValue(obj)!;
    }
}