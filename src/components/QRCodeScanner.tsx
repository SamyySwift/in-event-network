
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  width?: string;
  height?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  width = '100%',
  height = '300px',
}) => {
  const [scannerReady, setScannerReady] = useState(false);
  const qrId = 'connect-qr-reader';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const initializeScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(qrId);
        setScannerReady(true);

        const qrCodeSuccessCallback = (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          if (html5QrCode) {
            html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
          }
        };

        const config = { fps: 10, qrbox: { width: 200, height: 200 } };

        if (html5QrCode) {
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              // Only log actual errors, not routine scanning messages
              if (!errorMessage.includes('NotFoundException')) {
                console.log('QR Scanner message:', errorMessage);
                if (onScanError) onScanError(errorMessage);
              }
            }
          );
        }
      } catch (err: any) {
        console.error("QR Scanner initialization error:", err);
        if (onScanError) onScanError(err.toString());
      }
    };

    initializeScanner();

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="qr-scanner-container">
      <div 
        id={qrId} 
        style={{ width, height }} 
        className="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
      >
        {!scannerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-connect-600"></div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-3 text-sm text-gray-500">
        Position the QR code within the scanner frame
      </div>
    </div>
  );
};

export default QRCodeScanner;
