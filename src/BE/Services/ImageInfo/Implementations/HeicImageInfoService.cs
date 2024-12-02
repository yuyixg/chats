using System.Drawing;
using System.Text;

namespace Chats.BE.Services.ImageInfo.Implementations;

internal class HeicImageInfoService : IImageInfoService
{
    public Size GetImageSize(byte[] imageFirst4KBytes)
    {
        if (imageFirst4KBytes == null || imageFirst4KBytes.Length < 8)
        {
            throw new ArgumentException("The provided byte array is insufficient for parsing.");
        }

        int offset = 0;
        int totalLength = imageFirst4KBytes.Length;
        Size maxSize = new(0, 0);
        uint maxArea = 0;

        while (offset + 8 <= totalLength)
        {
            uint boxSize = ReadUInt32(imageFirst4KBytes, offset);
            string boxType = Encoding.ASCII.GetString(imageFirst4KBytes, offset + 4, 4);

            if (boxSize == 1)
            {
                if (offset + 16 > totalLength)
                    break;
                boxSize = (uint)ReadUInt64(imageFirst4KBytes, offset + 8);
                offset += 8; // Skip to large box size start
            }
            else if (boxSize == 0)
            {
                boxSize = (uint)(totalLength - offset); // Box extends to the end of the file
            }

            int boxEnd = offset + (int)boxSize;
            if (boxEnd > totalLength)
                break;

            if (boxType == "meta")
            {
                int metaOffset = offset + 8;
                if (metaOffset + 4 <= boxEnd)
                {
                    metaOffset += 4; // Skip version and flags
                }
                ParseMetaBox(imageFirst4KBytes, metaOffset, boxEnd, ref maxSize, ref maxArea);
            }

            offset += (int)boxSize;
        }

        return maxSize;
    }

    private static void ParseMetaBox(byte[] data, int start, int end, ref Size maxSize, ref uint maxArea)
    {
        int offset = start;
        while (offset + 8 <= end)
        {
            uint boxSize = ReadUInt32(data, offset);
            string boxType = Encoding.ASCII.GetString(data, offset + 4, 4);

            if (boxSize == 1)
            {
                if (offset + 16 > data.Length)
                    break;
                boxSize = (uint)ReadUInt64(data, offset + 8);
                offset += 8;
            }
            else if (boxSize == 0)
            {
                boxSize = (uint)(end - offset);
            }

            int boxEnd = offset + (int)boxSize;
            if (boxEnd > end)
                break;

            if (boxType == "iprp")
            {
                ParseIprpBox(data, offset + 8, boxEnd, ref maxSize, ref maxArea);
            }

            offset += (int)boxSize;
        }
    }

    private static void ParseIprpBox(byte[] data, int start, int end, ref Size maxSize, ref uint maxArea)
    {
        int offset = start;
        while (offset + 8 <= end)
        {
            uint boxSize = ReadUInt32(data, offset);
            string boxType = Encoding.ASCII.GetString(data, offset + 4, 4);

            if (boxSize == 1)
            {
                if (offset + 16 > data.Length)
                    break;
                boxSize = (uint)ReadUInt64(data, offset + 8);
                offset += 8;
            }
            else if (boxSize == 0)
            {
                boxSize = (uint)(end - offset);
            }

            int boxEnd = offset + (int)boxSize;
            if (boxEnd > end)
                break;

            if (boxType == "ipco")
            {
                ParseIpcoBox(data, offset + 8, boxEnd, ref maxSize, ref maxArea);
            }

            offset += (int)boxSize;
        }
    }

    private static void ParseIpcoBox(byte[] data, int start, int end, ref Size maxSize, ref uint maxArea)
    {
        int offset = start;

        while (offset + 8 <= end)
        {
            uint boxSize = ReadUInt32(data, offset);
            string boxType = Encoding.ASCII.GetString(data, offset + 4, 4);

            if (boxSize == 1)
            {
                if (offset + 16 > data.Length)
                    break;
                boxSize = (uint)ReadUInt64(data, offset + 8);
                offset += 8;
            }
            else if (boxSize == 0)
            {
                boxSize = (uint)(end - offset);
            }

            int boxEnd = offset + (int)boxSize;
            if (boxEnd > end)
                break;

            if (boxType == "ispe")
            {
                if (offset + 20 <= data.Length)
                {
                    uint versionAndFlags = ReadUInt32(data, offset + 8);
                    uint width = ReadUInt32(data, offset + 12);
                    uint height = ReadUInt32(data, offset + 16);

                    uint area = width * height;
                    if (area > maxArea)
                    {
                        maxSize = new Size((int)width, (int)height);
                        maxArea = area;
                    }
                }
            }

            offset += (int)boxSize;
        }
    }

    private static uint ReadUInt32(byte[] data, int offset)
    {
        if (offset + 4 > data.Length)
            return 0;

        return (uint)((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]);
    }

    private static ulong ReadUInt64(byte[] data, int offset)
    {
        if (offset + 8 > data.Length)
            return 0;

        return ((ulong)ReadUInt32(data, offset) << 32) | ReadUInt32(data, offset + 4);
    }
}