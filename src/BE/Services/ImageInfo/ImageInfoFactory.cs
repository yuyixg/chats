using Chats.BE.Services.ImageInfo.Implementations;

namespace Chats.BE.Services.ImageInfo;

public static class ImageInfoFactory
{
    public static IImageInfoService CreateImageInfoService(string contentType)
    {
        // support files: jpg, png, gif, bmp, webp, avif, heic
        return contentType switch
        {
            "image/jpeg" => new JpegImageInfoService(),
            "image/png" => new PngImageInfoService(),
            "image/gif" => new GifImageInfoService(),
            "image/bmp" => new BmpImageInfoService(),
            "image/webp" => new WebpImageInfoService(),
            "image/avif" => new AvifImageInfoService(),
            "image/heic" => new HeicImageInfoService(),
            _ => throw new NotSupportedException($"Unsupported content type: {contentType}"),
        };
    }
}
