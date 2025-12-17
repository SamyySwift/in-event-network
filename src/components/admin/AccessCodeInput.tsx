import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Unlock } from 'lucide-react';
import { useReferralCode } from '@/hooks/useReferralCode';
import { usePayment } from '@/hooks/usePayment';

interface AccessCodeInputProps {
  eventId: string;
  eventName: string;
}

const AccessCodeInput: React.FC<AccessCodeInputProps> = ({
  eventId,
  eventName
}) => {
  const [accessCode, setAccessCode] = useState('');
  const { submitReferralCode, isSubmittingCode, isEventUnlockedByCode } = useReferralCode();
  const { isEventPaid } = usePayment();

  // Unified check for event access (payment OR access code)
  const isEventUnlocked = isEventPaid(eventId) || isEventUnlockedByCode(eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      submitReferralCode({ accessCode: accessCode.trim(), eventId });
      setAccessCode('');
    }
  };

  // Don't show if already unlocked
  if (isEventUnlocked) {
    return (
      <Card className="border-success/30 bg-gradient-to-br from-success/5 to-success/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-success/10 border border-success/20">
              <Unlock className="h-4 w-4 text-success" />
            </div>
            <CardTitle className="text-sm text-success">Event Unlocked</CardTitle>
          </div>
          <CardDescription className="text-xs">
            All premium features are now available for "{eventName}"
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm">Unlock Premium Features</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Enter an access code to unlock all premium features for this event
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="accessCode" className="text-xs font-medium">
              Access Code
            </Label>
            <Input
              id="accessCode"
              type="text"
              placeholder="Enter access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="h-8 text-sm"
              disabled={isSubmittingCode}
            />
          </div>
          <Button 
            type="submit" 
            size="sm"
            className="w-full h-8 text-xs"
            disabled={!accessCode.trim() || isSubmittingCode}
          >
            {isSubmittingCode ? 'Unlocking...' : 'Unlock Features'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccessCodeInput;