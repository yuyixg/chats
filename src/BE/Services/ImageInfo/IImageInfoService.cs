using System.Drawing;

namespace Chats.BE.Services.ImageInfo;

public interface IImageInfoService
{
    Size GetImageSize(byte[] imageFirst4KBytes);
}