import React from 'react';
import QRCode from 'react-qr-code';

interface QRCodePageProps {
  url: string;
}

const QRCodePage: React.FC<QRCodePageProps> = ({ url }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
  <h2 className="text-2xl font-bold mb-4">Scan this QR code to fill the feedback form</h2>
      <QRCode value={url} size={256} />
      <p className="mt-6 text-gray-600">Open your mobile camera or QR scanner app and scan the code above.</p>
    </div>
  );
};

export default QRCodePage;
