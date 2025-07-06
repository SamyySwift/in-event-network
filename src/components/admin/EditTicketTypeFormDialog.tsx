import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormInput, Settings } from 'lucide-react';
import { FormFieldBuilder } from './FormFieldBuilder';

interface EditTicketTypeFormDialogProps {
  ticketTypeId: string;
  ticketTypeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTicketTypeFormDialog({ 
  ticketTypeId, 
  ticketTypeName, 
  isOpen, 
  onClose 
}: EditTicketTypeFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            Configure Form Fields - {ticketTypeName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="form-builder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form-builder" className="flex items-center gap-2">
              <FormInput className="h-4 w-4" />
              Form Builder
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form-builder" className="mt-6">
            <FormFieldBuilder ticketTypeId={ticketTypeId} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Form Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how the custom form appears during ticket purchase.
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Form Position</span>
                    <span className="text-muted-foreground">Below purchase button</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Required Fields Validation</span>
                    <span className="text-muted-foreground">Before payment</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Response Storage</span>
                    <span className="text-muted-foreground">Linked to ticket</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Keep forms short to improve completion rates</li>
                  <li>• Use helper text to clarify what information you need</li>
                  <li>• Mark only essential fields as required</li>
                  <li>• Test the form on mobile devices before your event</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}