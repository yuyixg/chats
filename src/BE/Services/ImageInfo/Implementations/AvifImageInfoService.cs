using System.Drawing;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class AvifImageInfoService : IImageInfoService
{
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 12)
        {
            throw new ArgumentException("Invalid AVIF data.");
        }

        int offset = 0;
        int length = imageFirst4KBytes.Length;

        // Verify "ftyp" box at the beginning
        (uint size, string type) = ReadBoxHeader(imageFirst4KBytes, offset);
        if (type != "ftyp")
        {
            throw new Exception("Not a valid AVIF file (missing 'ftyp' box).");
        }

        offset += (int)size;
        if (offset >= length)
        {
            throw new Exception("Invalid AVIF file structure.");
        }

        // Iterate through the boxes to find 'meta' box
        while (offset + 8 <= length)
        {
            (uint boxSize, string boxType) = ReadBoxHeader(imageFirst4KBytes, offset);

            if (boxType == "meta")
            {
                // 'meta' box found, process it
                int metaBoxContentStart = offset + 8; // Skip the 'meta' box header (size and type)
                int metaBoxContentSize = (int)boxSize - 8; // Subtract header size

                return ParseMetaBox(imageFirst4KBytes, metaBoxContentStart, metaBoxContentSize);
            }
            else
            {
                // Skip this box
                offset += (int)boxSize;
            }
        }

        throw new Exception("Could not find 'meta' box in AVIF data.");
    }

    /// <summary>
    /// Parses the 'meta' box to find the width and height.
    /// </summary>
    static Size ParseMetaBox(byte[] bytes, int offset, int length)
    {
        int end = offset + length;

        // Skip the full box header (version and flags) if present
        offset += 4;

        while (offset + 8 <= end)
        {
            (uint boxSize, string boxType) = ReadBoxHeader(bytes, offset);

            if (boxType == "iprp")
            {
                // Item Properties Box
                int iprpBoxContentStart = offset + 8;
                int iprpBoxContentSize = (int)boxSize - 8;

                return ParseItemPropertiesBox(bytes, iprpBoxContentStart, iprpBoxContentSize);
            }
            else
            {
                // Skip this box
                offset += (int)boxSize;
            }
        }

        throw new Exception("Could not find 'iprp' box in 'meta' box.");
    }

    /// <summary>
    /// Parses the Item Properties Box ('iprp') to find the Image Spatial Extents Property ('ispe').
    /// </summary>
    static Size ParseItemPropertiesBox(byte[] bytes, int offset, int length)
    {
        int end = offset + length;

        // 'iprp' contains 'ipco' (Item Property Container Box)
        // We'll search for 'ipco' box
        while (offset + 8 <= end)
        {
            (uint boxSize, string boxType) = ReadBoxHeader(bytes, offset);

            if (boxType == "ipco")
            {
                int ipcoBoxContentStart = offset + 8;
                int ipcoBoxContentSize = (int)boxSize - 8;

                return ParseItemPropertyContainerBox(bytes, ipcoBoxContentStart, ipcoBoxContentSize);
            }
            else
            {
                // Skip this box
                offset += (int)boxSize;
            }
        }

        throw new Exception("Could not find 'ipco' box in 'iprp' box.");
    }

    /// <summary>
    /// Parses the Item Property Container Box ('ipco') to find the 'ispe' property.
    /// </summary>
    static Size ParseItemPropertyContainerBox(byte[] bytes, int offset, int length)
    {
        int end = offset + length;

        while (offset + 8 <= end)
        {
            (uint boxSize, string boxType) = ReadBoxHeader(bytes, offset);

            if (boxType == "ispe")
            {
                // Found 'ispe' box, extract width and height
                int ispeBoxContentStart = offset + 8;
                // 'ispe' box includes version and flags (4 bytes) before the width and height
                int width = ReadInt32BigEndian(bytes, ispeBoxContentStart + 4);
                int height = ReadInt32BigEndian(bytes, ispeBoxContentStart + 8);

                return new(width, height);
            }
            else
            {
                // Skip this box
                offset += (int)boxSize;
            }
        }

        throw new Exception("Could not find 'ispe' box in 'ipco' box.");
    }

    /// <summary>
    /// Reads a box header (size and type) from the byte array at a given offset.
    /// </summary>
    /// <returns>A tuple containing the box size and box type.</returns>
    static (uint size, string type) ReadBoxHeader(byte[] bytes, int offset)
    {
        if (offset + 8 > bytes.Length)
        {
            throw new Exception("Incomplete box header.");
        }

        uint size = ReadUInt32BigEndian(bytes, offset);
        string type = System.Text.Encoding.ASCII.GetString(bytes, offset + 4, 4);

        // Handle extended size
        if (size == 1)
        {
            // 64-bit extended size
            if (offset + 16 > bytes.Length)
            {
                throw new Exception("Incomplete extended box header.");
            }
            ulong largeSize = ReadUInt64BigEndian(bytes, offset + 8);
            size = (uint)(largeSize & 0xFFFFFFFF); // For files less than 4GB
                                                   // Note: This simplistic approach assumes files less than 4GB
        }
        else if (size == 0)
        {
            // Size extends to end of file; not handled in this implementation
            throw new Exception("Box size extends to end of file, not supported.");
        }

        return (size, type);
    }

    /// <summary>
    /// Reads a 4-byte unsigned big-endian integer from a byte array starting at a specified index.
    /// </summary>
    static uint ReadUInt32BigEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 4 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read a UInt32.");
        }
        return (uint)((bytes[startIndex] << 24) | (bytes[startIndex + 1] << 16) | (bytes[startIndex + 2] << 8) | bytes[startIndex + 3]);
    }

    /// <summary>
    /// Reads an 8-byte unsigned big-endian integer from a byte array starting at a specified index.
    /// </summary>
    static ulong ReadUInt64BigEndian(byte[] bytes, int startIndex)
    {
        if (startIndex + 8 > bytes.Length)
        {
            throw new ArgumentException("Not enough data to read a UInt64.");
        }
        return ((ulong)bytes[startIndex] << 56) | ((ulong)bytes[startIndex + 1] << 48) |
               ((ulong)bytes[startIndex + 2] << 40) | ((ulong)bytes[startIndex + 3] << 32) |
               ((ulong)bytes[startIndex + 4] << 24) | ((ulong)bytes[startIndex + 5] << 16) |
               ((ulong)bytes[startIndex + 6] << 8) | bytes[startIndex + 7];
    }

    /// <summary>
    /// Reads a 4-byte signed big-endian integer from a byte array starting at a specified index.
    /// </summary>
    static int ReadInt32BigEndian(byte[] bytes, int startIndex)
    {
        return unchecked((int)ReadUInt32BigEndian(bytes, startIndex));
    }
}