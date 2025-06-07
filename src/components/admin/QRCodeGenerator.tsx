
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeGeneratorProps {
  onRegenerateKey?: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onRegenerateKey }) => {
  const { currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  const accessKey = currentUser?.accessKey;
  const joinUrl = `${window.location.origin}/join`;

  const copyAccessKey = () => {
    if (accessKey) {
      navigator.clipboard.writeText(accessKey);
      toast({
        title: "Copied!",
        description: "Access key copied to clipboard",
      });
    }
  };

  const copyJoinUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    toast({
      title: "Copied!",
      description: "Join URL copied to clipboard",
    });
  };

  const regenerateAccessKey = async () => {
    if (!currentUser) return;

    setIsRegenerating(true);
    try {
      // Generate new access key by updating the profile
      // The trigger will automatically generate a new key
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          access_key: null, // This will trigger the function to generate a new key
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select('access_key')
        .single();

      if (error) {
        console.error('Error regenerating access key:', error);
        toast({
          title: "Error",
          description: "Failed to regenerate access key",
          variant: "destructive",
        });
        return;
      }

      // Update the current user context
      if (data) {
        await updateUser({ accessKey: data.access_key });
        toast({
          title: "Success!",
          description: "New access key generated successfully",
        });
        onRegenerateKey?.();
      }
    } catch (error) {
      console.error('Error regenerating access key:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!accessKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Access</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Access key not available. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Access</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share this access key with attendees to join your events
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Access Key</p>
            <p className="text-4xl font-mono font-bold tracking-widest text-primary">
              {accessKey}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyAccessKey}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Key
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateAccessKey}
              disabled={isRegenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Join URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
              {joinUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyJoinUrl}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Attendees can visit this URL and enter your access key to join all your events
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
