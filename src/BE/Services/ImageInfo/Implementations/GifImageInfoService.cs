using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class GifImageInfoService : IImageInfoService
{
    /// <summary>
    /// Extracts the width and height from the first 4KB of a GIF image file represented as a byte array.
    /// </summary>
    /// <param name="imageFirst4KBytes">The first 4KB bytes of a GIF image file.</param>
    /// <returns>A tuple containing the width and height of the GIF image.</returns>
    /// <exception cref="ArgumentException">Thrown when image data is invalid or insufficient.</exception>
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 10)
        {
            throw new ArgumentException("Invalid GIF data.");
        }

        // Verify GIF Signature "GIF87a" or "GIF89a"
        string signature = System.Text.Encoding.ASCII.GetString(imageFirst4KBytes, 0, 6);
        if (signature != "GIF87a" && signature != "GIF89a")
        {
            throw new Exception("Not a valid GIF file.");
        }

        // GIF uses little-endian byte order for width and height
        int width = ReadInt16LittleEndian(imageFirst4KBytes, 6);
        int height = ReadInt16LittleEndian(imageFirst4KBytes, 8);

        return new Size(width, height);
    }

    /// <summary>
    /// Reads a 2-byte little-endian integer from a byte array starting at a specified index.
    /// </summary>
    /// <param name="bytes">The byte array containing the data.</param>
    /// <param name="startIndex">The starting index in the array.</param>
    /// <returns>The 16-bit integer read from the array.</returns>
    /// <exception cref="ArgumentException">Thrown when there is not enough data to read.</exception>
    static int ReadInt16LittleEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 2 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read an Int16.");
        }
        return bytes[startIndex] + (bytes[startIndex + 1] << 8);
    }
}