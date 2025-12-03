"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";

interface QRCodeDisplayProps {
  url: string;
  roomCode: string;
}

export function QRCodeDisplay({ url, roomCode }: QRCodeDisplayProps) {
  const t = useTranslations("host");

  return (
    <div className="shadow-material-3 flex flex-col items-center space-y-6 rounded-3xl border border-gray-100 bg-white p-8">
      <h3 className="text-2xl font-bold text-gray-900">{t("scanToJoin")}</h3>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <QRCodeSVG value={url} size={200} level="H" includeMargin={false} />
      </div>

      <div className="text-center">
        <p className="mb-2 text-gray-500">{t("orGoTo")}</p>
        <p className="font-mono text-lg break-all text-blue-600">{url}</p>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">{t("roomCode")}</p>
        <p className="text-4xl font-bold tracking-widest text-gray-900">
          {roomCode}
        </p>
      </div>
    </div>
  );
}
