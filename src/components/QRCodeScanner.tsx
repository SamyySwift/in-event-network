
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const qrId = 'connect-qr-reader';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const initializeScanner = async () => {
      try {
        console.log('Initializing QR scanner...');
        setError('');
        setPermissionDenied(false);
        setIsInitializing(true);
        
        html5QrCode = new Html5Qrcode(qrId);

        const qrCodeSuccessCallback = (decodedText: string) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          if (html5QrCode) {
            html5QrCode.stop().catch(err => console.error('Error stopping scanner:', err));
          }
        };

        const config = { 
          fps: 10, 
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0
        };

        console.log('Starting camera...');
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

        console.log('Camera started successfully');
        setScannerReady(true);
        setIsInitializing(false);
      } catch (err: any) {
        console.error("QR Scanner initialization error:", err);
        setIsInitializing(false);
        
        if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission denied')) {
          setPermissionDenied(true);
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (err.toString().includes('NotFoundError')) {
          setError('No camera found. Please make sure you have a camera connected.');
        } else {
          setError('Failed to initialize camera. Please try again.');
        }
        
        if (onScanError) onScanError(err.toString());
      }
    };

    // Add a small delay to ensure the DOM element is ready
    const timeoutId = setTimeout(initializeScanner, 100);

    return () => {
      clearTimeout(timeoutId);
      if (html5QrCode?.isScanning) {
        html5QrCode
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
    };
  }, [onScanSuccess, onScanError]);

  const requestPermissionAgain = () => {
    window.location.reload();
  };

  if (permissionDenied || error) {
    return (
      <div 
        style={{ width, height }} 
        className="relative rounded-lg bg-gray-100 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300"
      >
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
          {permissionDenied ? 'Camera Permission Required' : 'Camera Error'}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          {error}
        </p>
        {permissionDenied && (
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-400">
              1. Click the camera icon in your browser's address bar<br/>
              2. Select "Allow" for camera permissions<br/>
              3. Refresh this page
            </p>
            <Button onClick={requestPermissionAgain} size="sm" className="mt-3">
              <Camera className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="qr-scanner-container">
      <div 
        id={qrId} 
        style={{ width, height }} 
        className="relative rounded-lg overflow-hidden border bg-black"
      >
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-connect-600"></div>
              <p className="text-sm text-gray-600">Initializing camera...</p>
            </div>
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
