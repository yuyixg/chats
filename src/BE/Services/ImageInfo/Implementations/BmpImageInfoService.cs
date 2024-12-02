using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class BmpImageInfoService : IImageInfoService
{
    /// <summary>
    /// Extracts the width and height from the first 4KB of a BMP image file represented as a byte array.
    /// </summary>
    /// <param name="imageFirst4KBytes">The first 4KB bytes of a BMP image file.</param>
    /// <returns>A tuple containing the width and height of the BMP image.</returns>
    /// <exception cref="ArgumentException">Thrown when image data is invalid or insufficient.</exception>
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 26)
        {
            throw new ArgumentException("Invalid BMP data.");
        }

        // Verify BMP signature "BM"
        if (imageFirst4KBytes[0] != 0x42 || imageFirst4KBytes[1] != 0x4D) // 'B', 'M'
        {
            throw new Exception("Not a valid BMP file.");
        }

        // Read the size of the DIB header to determine which header is used
        int dibHeaderSize = ReadInt32LittleEndian(imageFirst4KBytes, 14);

        int width;
        int height;

        if (dibHeaderSize == 12)
        {
            // BITMAPCOREHEADER (OS/2 BMP format)
            // Width and height are 16-bit unsigned integers
            if (imageFirst4KBytes.Length < 26)
            {
                throw new Exception("Insufficient BMP data for BITMAPCOREHEADER.");
            }

            width = ReadUInt16LittleEndian(imageFirst4KBytes, 18);
            height = ReadUInt16LittleEndian(imageFirst4KBytes, 20);
        }
        else if (dibHeaderSize == 40 || dibHeaderSize == 52 || dibHeaderSize == 56 ||
                 dibHeaderSize == 108 || dibHeaderSize == 124)
        {
            // BITMAPINFOHEADER and other Windows BMP formats
            // Width and height are 32-bit signed integers
            if (imageFirst4KBytes.Length < 26)
            {
                throw new Exception("Insufficient BMP data for BITMAPINFOHEADER.");
            }

            width = ReadInt32LittleEndian(imageFirst4KBytes, 18);
            height = Math.Abs(ReadInt32LittleEndian(imageFirst4KBytes, 22)); // Height can be negative

            // Note: If height is negative, it means the bitmap is a top-down DIB
            // which means the origin is the top-left corner
        }
        else
        {
            throw new Exception($"Unsupported DIB header size: {dibHeaderSize} bytes.");
        }

        return new Size(width, height);
    }

    /// <summary>
    /// Reads a 2-byte unsigned little-endian integer from a byte array starting at a specified index.
    /// </summary>
    static int ReadUInt16LittleEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 2 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read a UInt16.");
        }
        return bytes[startIndex] | (bytes[startIndex + 1] << 8);
    }

    /// <summary>
    /// Reads a 4-byte signed little-endian integer from a byte array starting at a specified index.
    /// </summary>
    static int ReadInt32LittleEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 4 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read an Int32.");
        }
        return bytes[startIndex] | (bytes[startIndex + 1] << 8) | (bytes[startIndex + 2] << 16) | (bytes[startIndex + 3] << 24);
    }
}