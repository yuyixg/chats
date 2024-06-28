import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import * as QRCode from 'qrcode';

const QRCodeImage = (props: {
  url: string;
  title?: string;
  titleSize?: number;
  width?: number;
  height?: number;
  onSuccess?: () => void;
}) => {
  const { url, title, titleSize, width, height, onSuccess } = props;
  const qcCodeWidth = width || 256,
    qcCodeHeight = height || 256;
  const qcCodeTitleSize = titleSize || 12;

  const [qrCodeUrl, setQRCodeUrl] = useState('');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    QRCode.toDataURL(
      document.getElementById('qrCode') as HTMLCanvasElement,
      url,
      {
        width: 256,
      },
      (error, url) => {
        if (!error) {
          imageRef.current!.src = url;
          setTimeout(() => {
            var qcCanvas = document.getElementById(
              'qrCodeCanvas',
            ) as HTMLCanvasElement;
            const dpr = window.devicePixelRatio;
            const { width, height } = qcCanvas;
            qcCanvas.width = Math.round(width * dpr);
            qcCanvas.height = Math.round(height * dpr);
            qcCanvas.style.width = width + 'px';
            qcCanvas.style.height = height + 'px';
            var ctx = qcCanvas.getContext('2d')!;
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, qcCanvas.width, qcCanvas.height);

            ctx.drawImage(imageRef.current!, 0, 0, qcCodeWidth, qcCodeHeight);

            ctx.strokeStyle = '#000';
            ctx.font = qcCodeTitleSize + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              title || '',
              qcCanvas.width / (2 * dpr),
              qcCanvas.height / dpr - 10,
            );
            setQRCodeUrl(qcCanvas.toDataURL());
            qcCanvas.width = qcCodeWidth;
            qcCanvas.height = qcCodeHeight;
            onSuccess && onSuccess();
          }, 100);
        }
      },
    );
  });

  return (
    <>
      <div className="flex justify-center items-center">
        <canvas hidden id="qrCode"></canvas>
        <canvas
          hidden
          width={qcCodeWidth}
          height={qcCodeHeight}
          id="qrCodeCanvas"
        ></canvas>
        <img
          ref={imageRef}
          hidden
          alt=""
          style={{ width: qcCodeWidth, height: qcCodeHeight }}
        />
      </div>
      <div>
        {qrCodeUrl && (
          <img
            src={qrCodeUrl}
            alt=""
            style={{ width: qcCodeWidth, height: qcCodeHeight }}
          ></img>
        )}
      </div>
    </>
  );
};

export default QRCodeImage;
