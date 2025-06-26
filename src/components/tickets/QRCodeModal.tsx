
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

type QRCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  qrData: string;
  title: string;
};

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, qrData, title }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (qrData) {
      QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR Code generation error:', err));
    }
  }, [qrData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 p-6">
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="border-2 border-gray-200 rounded-lg"
            />
          )}
          <p className="text-sm text-muted-foreground text-center">
            Show this QR code at the event entrance for check-in
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;
