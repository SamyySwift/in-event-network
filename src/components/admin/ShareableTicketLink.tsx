
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Share2, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function ShareableTicketLink() {
  const { selectedEventId } = useAdminEventContext();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch event key
  const { data: event } = useQuery({
    queryKey: ['event-key', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null;
      
      const { data, error } = await supabase
        .from('events')
        .select('event_key')
        .eq('id', selectedEventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventId,
  });

  const ticketUrl = event ? `${window.location.origin}/buy-tickets/${event.event_key}` : '';

  const copyToClipboard = async () => {
    if (!ticketUrl) return;
    
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Ticket purchase link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank');
    }
  };

  if (!selectedEventId || !event) {
    return null;
  }

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
          Share this link with potential attendees so they can purchase tickets directly.
        </p>
        
        <div className="flex gap-2">
          <Input
            value={ticketUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          This link allows anyone to purchase tickets without needing to log in or register.
        </div>
      </CardContent>
    </Card>
  );
}
