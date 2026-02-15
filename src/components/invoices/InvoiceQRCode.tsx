/**
 * @fileoverview InvoiceQRCode
 * Generates a QR code image for React-PDF.
 */
import { useEffect, useState } from "react";
import { Image } from "@react-pdf/renderer";
import QRCode from "qrcode";

interface InvoiceQRCodeProps {
  url: string;
  size?: number; // Size in points (pt)
}

export default function InvoiceQRCode({ url, size = 60 }: InvoiceQRCodeProps) {
  const [qrImage, setQrImage] = useState<string>("");

  useEffect(() => {
    if (!url) return;

    // Generate Base64 Data URL
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 0,
      color: {
        dark: "#000000",
        light: "#00000000", 
      },
    })
      .then((dataUrl) => {
        setQrImage(dataUrl);
      })
      .catch((err) => {
        console.error("QR Generation Error", err);
      });
  }, [url]);

  if (!qrImage) return null;

  return (
    <Image 
      src={qrImage} 
      style={{ width: size, height: size }} 
    />
  );
}