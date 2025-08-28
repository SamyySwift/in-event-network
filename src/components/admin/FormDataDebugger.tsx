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
      setDebugResult({ error: error.message });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleTestInsert = async () => {
    if (!ticketId.trim()) return;
    
    try {
      // Use the first form field ID from the form fields we found
      await testFormResponseInsertion(ticketId, '8f750877-c5bb-4a97-a69c-a43cc8a0f30f', 'Test Name');
      console.log('Test insertion completed');
    } catch (error) {
      console.error('Test insertion error:', error);
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
            placeholder="Enter ticket ID to debug (or use: 8fe370cf-6dd9-49da-b9d2-be5184e6f818)"
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
          <Button 
            onClick={handleTestInsert}
            disabled={!ticketId.trim()}
            variant="outline"
          >
            Test Insert
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