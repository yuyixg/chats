namespace Chats.BE.Services.ImageInfo;

public class PartialBufferedStream : Stream
{
    private readonly Stream _baseStream;
    private readonly byte[] _seekedBytes;
    private long _position;
    private bool _seekedBytesRead;

    public PartialBufferedStream(Stream baseStream, int seekBytes)
    {
        _baseStream = baseStream;
        _seekedBytes = new byte[seekBytes];
        int bytesRead = _baseStream.Read(_seekedBytes, 0, seekBytes);
        if (bytesRead < seekBytes)
        {
            Array.Resize(ref _seekedBytes, bytesRead);
        }
        _position = 0;
        _seekedBytesRead = false;
    }

    public byte[] SeekedBytes => _seekedBytes;

    public override bool CanRead => _baseStream.CanRead;

    public override bool CanSeek => _baseStream.CanSeek;

    public override bool CanWrite => _baseStream.CanWrite;

    public override long Length => _baseStream.Length;

    public override long Position
    {
        get => _position;
        set => throw new NotSupportedException();
    }

    public override void Flush()
    {
        // do nothing
    }

    public override int Read(byte[] buffer, int offset, int count)
    {
        int bytesRead = 0;

        if (!_seekedBytesRead)
        {
            int seekedBytesRemaining = _seekedBytes.Length - (int)_position;
            int bytesToReadFromSeeked = Math.Min(seekedBytesRemaining, count);
            Array.Copy(_seekedBytes, _position, buffer, offset, bytesToReadFromSeeked);
            bytesRead += bytesToReadFromSeeked;
            _position += bytesToReadFromSeeked;
            offset += bytesToReadFromSeeked;
            count -= bytesToReadFromSeeked;

            if (_position >= _seekedBytes.Length)
            {
                _seekedBytesRead = true;
            }
        }

        if (count > 0)
        {
            bytesRead += _baseStream.Read(buffer, offset, count);
        }

        return bytesRead;
    }

    public override long Seek(long offset, SeekOrigin origin)
    {
        if (offset <= _seekedBytes.Length && origin == SeekOrigin.Begin)
        {
            _position = offset;
            return _position;
        }
        throw new NotSupportedException("Seek operation is not supported.");
    }

    public override void SetLength(long value)
    {
        throw new NotSupportedException("SetLength operation is not supported.");
    }

    public override void Write(byte[] buffer, int offset, int count)
    {
        throw new NotSupportedException("Write operation is not supported.");
    }
}