
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import QRCodeGenerator from "@/components/admin/QRCodeGenerator";
import { Skeleton } from "@/components/ui/skeleton";

interface RegistrationQRCodeCardProps {
  accessKey?: string | null;
  isLoading: boolean;
}

const RegistrationQRCodeCard: React.FC<RegistrationQRCodeCardProps> = ({ accessKey, isLoading }) => (
  <Card className="glass-card">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <QrCode className="h-5 w-5 text-primary" />
        Event Registration QR
      </CardTitle>
      <CardDescription>
        Share this QR code for easy event registration.
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col items-center">
      {accessKey ? (
        <QRCodeGenerator
          eventName="Join Event"
          eventUrl={`${window.location.origin}/register?code=${accessKey}`}
        />
      ) : (
        isLoading ?
          <div className="flex flex-col items-center justify-center h-48">
            <Skeleton className="h-32 w-32" />
            <Skeleton className="h-4 w-40 mt-4" />
          </div>
          :
          <div className="text-muted-foreground text-center p-4">
            Access key not available. Please contact support.
          </div>
      )}
    </CardContent>
  </Card>
);

export default RegistrationQRCodeCard;
