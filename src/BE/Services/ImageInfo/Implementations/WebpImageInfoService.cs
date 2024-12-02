using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class WebpImageInfoService : IImageInfoService
{
    /// <summary>
    /// Extracts the width and height from the first 4KB of a WebP image file represented as a byte array.
    /// </summary>
    /// <param name="imageFirst4KBytes">The first 4KB bytes of a WebP image file.</param>
    /// <returns>A tuple containing the width and height of the WebP image.</returns>
    /// <exception cref="ArgumentException">Thrown when image data is invalid or insufficient.</exception>
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 30)
        {
            throw new ArgumentException("Invalid WebP data.");
        }

        int offset = 0;

        // Verify "RIFF" header
        string riffHeader = System.Text.Encoding.ASCII.GetString(imageFirst4KBytes, offset, 4);
        if (riffHeader != "RIFF")
        {
            throw new Exception("Not a valid WebP file (missing RIFF header).");
        }
        offset += 4;

        // Skip 4 bytes: File size
        offset += 4;

        // Verify "WEBP" signature
        string webpHeader = System.Text.Encoding.ASCII.GetString(imageFirst4KBytes, offset, 4);
        if (webpHeader != "WEBP")
        {
            throw new Exception("Not a valid WebP file (missing WEBP header).");
        }
        offset += 4;

        while (offset + 8 <= imageFirst4KBytes.Length)
        {
            // Read chunk type
            string chunkType = System.Text.Encoding.ASCII.GetString(imageFirst4KBytes, offset, 4);
            offset += 4;

            // Read chunk size (little endian)
            int chunkSize = ReadInt32LittleEndian(imageFirst4KBytes, offset);
            offset += 4;

            // Ensure chunkSize is positive and does not exceed the remaining data
            if (chunkSize < 0 || offset + chunkSize > imageFirst4KBytes.Length)
            {
                throw new Exception("Invalid chunk size in WebP file.");
            }

            if (chunkType == "VP8 ")
            {
                // Lossy WebP image
                return ParseVP8Chunk(imageFirst4KBytes, offset, chunkSize);
            }
            else if (chunkType == "VP8L")
            {
                // Lossless WebP image
                return ParseVP8LChunk(imageFirst4KBytes, offset, chunkSize);
            }
            else if (chunkType == "VP8X")
            {
                // Extended WebP image (may contain Animation, Exif, etc.)
                return ParseVP8XChunk(imageFirst4KBytes, offset, chunkSize);
            }
            else
            {
                // Skip this chunk (chunk size + padding byte if chunk size is odd)
                offset += chunkSize + (chunkSize % 2);
            }
        }

        throw new Exception("Could not find VP8/VP8L/VP8X chunk in WebP data.");
    }

    /// <summary>
    /// Parses the VP8 chunk (lossy WebP) to extract width and height.
    /// </summary>
    static Size ParseVP8Chunk(byte[] bytes, int offset, int chunkSize)
    {
        // Ensure we have enough data
        if (offset + 10 > bytes.Length)
        {
            throw new Exception("Invalid VP8 chunk data.");
        }

        // Check for the start code 0x9D012A
        if (bytes[offset + 3] != 0x9D || bytes[offset + 4] != 0x01 || bytes[offset + 5] != 0x2A)
        {
            throw new Exception("Invalid VP8 frame header.");
        }

        // Read width (16 bits, little endian)
        int width = ReadInt16LittleEndian(bytes, offset + 6) & 0x3FFF; // 14 bits for width
                                                                       // Read height (16 bits, little endian)
        int height = ReadInt16LittleEndian(bytes, offset + 8) & 0x3FFF; // 14 bits for height

        return new Size(width, height);
    }

    /// <summary>
    /// Parses the VP8L chunk (lossless WebP) to extract width and height.
    /// </summary>
    static Size ParseVP8LChunk(byte[] bytes, int offset, int chunkSize)
    {
        // Ensure we have enough data
        if (offset + 5 > bytes.Length)
        {
            throw new Exception("Invalid VP8L chunk data.");
        }

        // The first byte is the signature
        if (bytes[offset] != 0x2F)
        {
            throw new Exception("Invalid VP8L signature.");
        }

        // Read 4 bytes for width and height
        uint bits = (uint)ReadInt32LittleEndian(bytes, offset + 1);

        int width = (int)((bits & 0x3FFF) + 1);
        int height = (int)(((bits >> 14) & 0x3FFF) + 1);

        return new Size(width, height);
    }

    /// <summary>
    /// Parses the VP8X chunk (extended WebP) to extract canvas width and height.
    /// </summary>
    static Size ParseVP8XChunk(byte[] bytes, int offset, int chunkSize)
    {
        // Ensure we have enough data
        if (offset + 10 > bytes.Length)
        {
            throw new Exception("Invalid VP8X chunk data.");
        }

        // Read canvas width and height (24 bits each, little endian)
        int width = ((bytes[offset + 4] << 16) | (bytes[offset + 3] << 8) | bytes[offset + 2]) + 1;
        int height = ((bytes[offset + 7] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 5]) + 1;

        return new Size(width, height);
    }

    /// <summary>
    /// Reads a 2-byte little-endian integer from a byte array starting at a specified index.
    /// </summary>
    static int ReadInt16LittleEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 2 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read an Int16.");
        }
        return bytes[startIndex] | (bytes[startIndex + 1] << 8);
    }

    /// <summary>
    /// Reads a 4-byte little-endian integer from a byte array starting at a specified index.
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