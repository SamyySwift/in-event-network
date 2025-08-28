import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { debugFormDataFlow, testFormResponseInsertion } from '@/utils/formDataDebug';

export const FormDataDebugger: React.FC = () => {
  const [ticketId, setTicketId] = useState('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const handleDebug = async () => {
    if (!ticketId.trim()) return;
    
    setIsDebugging(true);
    try {
      const result = await debugFormDataFlow(ticketId);
      setDebugResult(result);
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Form Data Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ticket ID to debug"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleDebug} 
            disabled={isDebugging || !ticketId.trim()}
          >
            {isDebugging ? 'Debugging...' : 'Debug'}
          </Button>
        </div>
        
        {debugResult && (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Debug Results:</h4>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(debugResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};