using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class PngImageInfoService : IImageInfoService
{
    /// <summary>
    /// Extracts the width and height from the first 4KB of a PNG image file represented as a byte array.
    /// </summary>
    /// <param name="imageFirst4KBytes">The first 4KB bytes of a PNG image file.</param>
    /// <returns>A tuple containing the width and height of the PNG image.</returns>
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 33) // 8(signature) + 4(length) + 4(chunk type) + 13(IHDR data) + 4(CRC)
        {
            throw new ArgumentException("Invalid PNG data.");
        }

        // Verify PNG signature
        byte[] pngSignature = [0x89, (byte)'P', (byte)'N', (byte)'G', 0x0D, 0x0A, 0x1A, 0x0A];
        for (int i = 0; i < 8; i++)
        {
            if (imageFirst4KBytes[i] != pngSignature[i])
            {
                throw new Exception("Not a valid PNG file.");
            }
        }

        int offset = 8;

        // Read chunk length (should be 13 for IHDR)
        int length = ReadInt32BigEndian(imageFirst4KBytes, offset);
        offset += 4;

        // Read chunk type
        string chunkType = System.Text.Encoding.ASCII.GetString(imageFirst4KBytes, offset, 4);
        offset += 4;

        if (chunkType != "IHDR")
        {
            throw new Exception("IHDR chunk not found where expected.");
        }

        if (length != 13)
        {
            throw new Exception("Invalid IHDR chunk length.");
        }

        // Read IHDR chunk data
        int width = ReadInt32BigEndian(imageFirst4KBytes, offset);
        int height = ReadInt32BigEndian(imageFirst4KBytes, offset + 4);
        // Additional IHDR data could be processed here if needed
        // Update offset
        offset += length;

        return new Size(width, height);
    }

    /// <summary>
    /// Reads a 4-byte big-endian integer from a byte array starting at a specified index.
    /// </summary>
    /// <param name="bytes">The byte array containing the data.</param>
    /// <param name="startIndex">The starting index in the array.</param>
    /// <returns>The 32-bit integer read from the array.</returns>
    static int ReadInt32BigEndian(byte[] bytes, int startIndex)
    {
        // Ensure we don't read beyond the array length
        if (startIndex + 4 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read an Int32.");
        }

        uint b0 = bytes[startIndex + 0];
        uint b1 = bytes[startIndex + 1];
        uint b2 = bytes[startIndex + 2];
        uint b3 = bytes[startIndex + 3];
        uint value = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
        return unchecked((int)value);
    }

}