
import React, { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
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
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string>('');

  const handleScan = (result: any) => {
    if (result && result.text) {
      console.log('QR Code scanned:', result.text);
      onScanSuccess(result.text);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    
    if (error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')) {
      setPermissionDenied(true);
      setError('Camera permission denied. Please allow camera access and try again.');
    } else if (error?.name === 'NotFoundError') {
      setError('No camera found. Please make sure you have a camera connected.');
    } else if (error?.name === 'NotReadableError') {
      setError('Camera is already in use by another application. Please close other camera apps and try again.');
    } else {
      setError(`Camera error: ${error?.message || 'Unknown error'}`);
    }
    
    if (onScanError) onScanError(error?.message || 'Scanner error');
  };

  const requestPermissionAgain = () => {
    setPermissionDenied(false);
    setError('');
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
        style={{ width, height }} 
        className="relative rounded-lg overflow-hidden border"
      >
        <QrScanner
          onDecode={handleScan}
          onError={handleError}
          constraints={{
            facingMode: 'environment'
          }}
          containerStyle={{
            width: '100%',
            height: '100%'
          }}
          videoStyle={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      
      <div className="text-center mt-3 text-sm text-gray-500">
        Position the QR code within the scanner frame
      </div>
    </div>
  );
};

export default QRCodeScanner;
