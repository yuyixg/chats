using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class JpegImageInfoService : IImageInfoService
{
    /// <summary>
    /// Extracts the width and height from the first 4KB of a JPEG image file represented as a byte array.
    /// </summary>
    /// <param name="imageFirst4KBytes">The first 4KB bytes of a JPEG image file.</param>
    /// <returns>A tuple containing the width and height of the JPEG image.</returns>
    /// <exception cref="ArgumentException">Thrown when image data is invalid or insufficient.</exception>
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 4)
        {
            throw new ArgumentException("Invalid JPEG data.");
        }

        int offset = 0;
        int length = imageFirst4KBytes.Length;

        // Check for SOI marker (Start of Image) 0xFFD8
        if (imageFirst4KBytes[offset] != 0xFF || imageFirst4KBytes[offset + 1] != 0xD8)
        {
            throw new Exception("Not a valid JPEG file.");
        }
        offset += 2;

        while (offset < length)
        {
            // Ensure that we have at least two bytes to read the marker
            if (offset + 1 >= length)
            {
                throw new Exception("Invalid JPEG file structure.");
            }

            // Markers are prefixed with 0xFF
            if (imageFirst4KBytes[offset] != 0xFF)
            {
                // Skip any padding bytes (0xFF)
                offset++;
                continue;
            }

            // Read the marker byte
            byte marker = imageFirst4KBytes[offset + 1];
            offset += 2;

            // Some markers consist of just 0xFF plus the marker code with no additional data
            // The markers between 0xD0 and 0xD9 are reset markers and standalone
            if (marker == 0xD0 || marker == 0xD1 || marker == 0xD2 || marker == 0xD3 ||
                marker == 0xD4 || marker == 0xD5 || marker == 0xD6 || marker == 0xD7 ||
                marker == 0xD8 || marker == 0xD9)
            {
                continue;
            }

            // Ensure we can read the length of the segment
            if (offset + 1 >= length)
            {
                throw new Exception("Invalid JPEG file structure.");
            }

            // Read the length of segment
            int segmentLength = ReadInt16BigEndian(imageFirst4KBytes, offset);
            offset += 2;

            if (segmentLength < 2)
            {
                throw new Exception("Invalid segment length in JPEG file.");
            }

            // Check for Start of Frame markers (SOF0-SOF15), except for differential ones (usually not used)
            if ((marker >= 0xC0 && marker <= 0xC3) ||
                (marker >= 0xC5 && marker <= 0xC7) ||
                (marker >= 0xC9 && marker <= 0xCB) ||
                (marker >= 0xCD && marker <= 0xCF))
            {
                // Make sure we have enough data for SOF segment (minimum 7 bytes after length)
                if (offset + 7 > length)
                {
                    throw new Exception("Invalid JPEG file structure.");
                }

                // Skip the sample precision byte
                offset += 1;

                // Read image height and width (each are two bytes)
                int height = ReadInt16BigEndian(imageFirst4KBytes, offset);
                offset += 2;

                int width = ReadInt16BigEndian(imageFirst4KBytes, offset);
                offset += 2;

                return new Size(width, height);
            }
            else
            {
                // Skip over this segment's data
                offset += segmentLength - 2;
            }
        }

        throw new Exception("Could not find SOF marker in JPEG data.");
    }

    /// <summary>
    /// Reads a 2-byte big-endian integer from a byte array starting at a specified index.
    /// </summary>
    /// <param name="bytes">The byte array containing the data.</param>
    /// <param name="startIndex">The starting index in the array.</param>
    /// <returns>The 16-bit integer read from the array.</returns>
    /// <exception cref="ArgumentException">Thrown when there is not enough data to read.</exception>
    static int ReadInt16BigEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 2 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read an Int16.");
        }
        return (bytes[startIndex] << 8) + bytes[startIndex + 1];
    }

}