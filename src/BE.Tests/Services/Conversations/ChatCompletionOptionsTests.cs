using Chats.BE.Services.ChatServices.Extensions;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace Chats.BE.Tests.Services.Conversations;

public class ChatCompletionOptionsTests
{
    private static ChatCompletionOptions CreateCCOWithDictionary(Dictionary<string, BinaryData> data)
    {
        ChatCompletionOptions options = new();
        SetSerializedAdditionalRawData(options, data);
        return options;
    }

    [UnsafeAccessor(UnsafeAccessorKind.Method, Name = "set_SerializedAdditionalRawData")]
    extern static void SetSerializedAdditionalRawData(ChatCompletionOptions @this, IDictionary<string, BinaryData> data);

    [Fact]
    public void IsSearchEnabled_ReturnsTrue_WhenEnableSearchIsTrue()
    {
        // Arrange
        var options = CreateCCOWithDictionary(new Dictionary<string, BinaryData>
        {
            { "enable_search", BinaryData.FromObjectAsJson(true) }
        });

        // Act
        bool result = options.IsSearchEnabled();

        // Assert
        Assert.True(result);
    }

    [Fact]
    public void IsSearchEnabled_ReturnsFalse_WhenEnableSearchIsFalse()
    {
        // Arrange
        var options = CreateCCOWithDictionary(new Dictionary<string, BinaryData>
        {
            { "enable_search", BinaryData.FromObjectAsJson(false) }
        });

        // Act
        bool result = options.IsSearchEnabled();

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void IsSearchEnabled_ReturnsFalse_WhenEnableSearchIsNotPresent()
    {
        // Arrange
        var options = CreateCCOWithDictionary([]);

        // Act
        bool result = options.IsSearchEnabled();

        // Assert
        Assert.False(result);
    }
}
