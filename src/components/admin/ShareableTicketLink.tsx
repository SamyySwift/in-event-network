
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

export const ShareableTicketLink = () => {
  const { toast } = useToast();
  const { selectedEvent } = useAdminEventContext();

  if (!selectedEvent) {
    return null;
  }

  // Generate the shareable ticket link with the from=ticket parameter
  const shareableUrl = `${window.location.origin}/buy-tickets/${selectedEvent.event_key}?from=ticket`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableUrl);
    toast({
      title: "Link Copied!",
      description: "The ticket purchase link has been copied to your clipboard.",
    });
  };

  const openInNewTab = () => {
    window.open(shareableUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Shareable Ticket Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="shareable-url">Share this link to allow ticket purchases:</Label>
          <div className="flex gap-2">
            <Input
              id="shareable-url"
              value={shareableUrl}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              onClick={openInNewTab}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>
            Users who click this link will be prompted to sign up or log in, then redirected to purchase tickets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
