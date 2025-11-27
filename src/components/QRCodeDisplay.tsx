'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useTranslations } from 'next-intl';

interface QRCodeDisplayProps {
  url: string;
  roomCode: string;
}

export function QRCodeDisplay({ url, roomCode }: QRCodeDisplayProps) {
  const t = useTranslations('host');

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-white rounded-3xl shadow-material-3 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900">{t('scanToJoin')}</h3>
      
      <div className="p-4 bg-white rounded-2xl border border-gray-200">
        <QRCodeSVG
          value={url}
          size={200}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div className="text-center">
        <p className="text-gray-500 mb-2">{t('orGoTo')}</p>
        <p className="text-blue-600 font-mono text-lg break-all">{url}</p>
      </div>
      
      <div className="text-center">
        <p className="text-gray-500 text-sm">{t('roomCode')}</p>
        <p className="text-4xl font-bold tracking-widest text-gray-900">{roomCode}</p>
      </div>
    </div>
  );
}
