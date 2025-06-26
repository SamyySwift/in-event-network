import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableTicketLinkProps {
  eventId: string;
}

const ShareableTicketLink: React.FC<ShareableTicketLinkProps> = ({ eventId }) => {
  const [copied, setCopied] = useState(false);
  
  // Change the URL to point to discovery page with eventId parameter
  const shareableUrl = `${window.location.origin}/discovery?eventId=${eventId}`;
  
  const { toast } = useToast();
  const ticketUrl = `${window.location.origin}/tickets/${eventId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticketUrl);
    toast({
      title: "Link Copied!",
      description: "Ticket purchase link has been copied to clipboard.",
    });
  };
  
  const openInNewTab = () => {
    window.open(ticketUrl, '_blank');
  };
  
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Event Tickets',
        text: 'Purchase tickets for this event',
        url: ticketUrl,
      });
    } else {
      copyToClipboard();
    }
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
        <p className="text-sm text-muted-foreground">
          Share this link to allow people to purchase tickets for your event. 
          Users will need to sign up before purchasing.
        </p>
        
        <div className="flex gap-2">
          <Input value={ticketUrl} readOnly className="flex-1" />
          <Button onClick={copyToClipboard} variant="outline" size="icon" title="Copy Link">
            <Copy className="h-4 w-4" />
          </Button>
          <Button onClick={openInNewTab} variant="outline" size="icon" title="Open in New Tab">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button onClick={shareLink} variant="outline" size="icon" title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          💡 Tip: Share this link on social media, email, or messaging apps to promote your event.
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareableTicketLink;