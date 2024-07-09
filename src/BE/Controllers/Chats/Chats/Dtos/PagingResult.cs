using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Chats.BE.Controllers.Chats.Chats.Dtos;

public record PagingResult<T> where T : class
{
    [JsonPropertyName("rows")]
    public required T[] Rows { get; init; }

    [JsonPropertyName("count")]
    public required int Count { get; init; }
}

public static class PagingResult
{
    public static async Task<PagingResult<TFinal>> From<TFinal>(IQueryable<TFinal> rows, CancellationToken cancellationToken) where TFinal : class
    {
        return new PagingResult<TFinal>
        {
            Rows = await rows.ToArrayAsync(cancellationToken),
            Count = await rows.CountAsync(cancellationToken)
        };
    }

    public static async Task<PagingResult<TFinal>> From<TTemp, TFinal>(IQueryable<TTemp> rows, Converter<TTemp, TFinal> tempConverter, CancellationToken cancellationToken) where TFinal : class where TTemp : class
    {
        TTemp[] tempData = await rows.ToArrayAsync(cancellationToken);
        TFinal[] finalData = Array.ConvertAll(tempData, tempConverter);
        return new PagingResult<TFinal>
        {
            Rows = finalData,
            Count = await rows.CountAsync(cancellationToken)
        };
    }
}