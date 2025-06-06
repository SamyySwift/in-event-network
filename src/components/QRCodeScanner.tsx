
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle } from 'lucide-react';

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
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrId = 'connect-qr-reader';

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        setError(null);
        
        // Check if camera is available
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length === 0) {
          setError('No cameras found on this device');
          return;
        }

        html5QrCodeRef.current = new Html5Qrcode(qrId);
        
        const qrCodeSuccessCallback = (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          stopScanner();
        };

        const qrCodeErrorCallback = (errorMessage: string) => {
          // Don't show errors for "No QR code found" as this is normal
          if (!errorMessage.includes('No QR code found')) {
            console.log('QR scan error:', errorMessage);
          }
        };

        const config = { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCodeRef.current.start(
          { facingMode: "environment" }, // Use back camera
          config,
          qrCodeSuccessCallback,
          qrCodeErrorCallback
        );

        setIsScanning(true);
      } catch (err: any) {
        console.error("QR Scanner initialization error:", err);
        setError(err.message || 'Failed to start camera');
        if (onScanError) onScanError(err.message || 'Failed to start camera');
      }
    };

    initializeScanner();

    return () => {
      stopScanner();
    };
  }, [onScanSuccess, onScanError]);

  const stopScanner = () => {
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err) => console.error("Error stopping scanner:", err));
    }
  };

  return (
    <div className="qr-scanner-container">
      <div 
        id={qrId} 
        style={{ width, height }} 
        className="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
      >
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-600">
            <Camera className="h-12 w-12 mb-4 animate-pulse" />
            <div className="text-center">
              <p className="text-sm font-medium">Starting camera...</p>
              <p className="text-xs mt-1">Please allow camera access</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600 p-4">
            <AlertCircle className="h-12 w-12 mb-4" />
            <div className="text-center">
              <p className="text-sm font-medium">Camera Error</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-3 text-sm text-gray-500">
        {isScanning ? (
          "Position the event QR code within the scanner frame"
        ) : error ? (
          "Please check camera permissions and try again"
        ) : (
          "Initializing camera..."
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
