import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Users, Calendar, Send, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessCodeRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
}

const AccessCodeRequestDialog: React.FC<AccessCodeRequestDialogProps> = ({
  isOpen,
  onClose,
  eventName,
}) => {
  const [eventDescription, setEventDescription] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventDescription.trim() || !expectedAttendees.trim() || !organizerContact.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields to request an access code.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate sending request (in production, this would call an API)
    try {
      // Format WhatsApp message
      const message = encodeURIComponent(
        `*Access Code Request*\n\n` +
        `*Event Name:* ${eventName}\n` +
        `*Event Description:* ${eventDescription}\n` +
        `*Expected Attendees:* ${expectedAttendees}\n` +
        `*Organizer Contact:* ${organizerContact}`
      );
      
      // Open WhatsApp with pre-filled message (replace with your support number)
      const whatsappUrl = `https://wa.me/2349099000000?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Request Sent',
        description: 'Your access code request has been submitted. We will contact you shortly.',
      });
      
      onClose();
      setEventDescription('');
      setExpectedAttendees('');
      setOrganizerContact('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-primary" />
            Request Access Code
          </DialogTitle>
          <DialogDescription className="text-sm">
            Tell us about your event to receive an access code for generating QR codes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="eventDescription" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Tell us about your event
            </Label>
            <Textarea
              id="eventDescription"
              placeholder="Describe your event, its purpose, and what attendees can expect..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedAttendees" className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Expected number of attendees
            </Label>
            <Input
              id="expectedAttendees"
              type="text"
              placeholder="e.g., 100-500 attendees"
              value={expectedAttendees}
              onChange={(e) => setExpectedAttendees(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizerContact" className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              Organizer contact (WhatsApp)
            </Label>
            <Input
              id="organizerContact"
              type="tel"
              placeholder="e.g., +234 801 234 5678"
              value={organizerContact}
              onChange={(e) => setOrganizerContact(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Get Access Code
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessCodeRequestDialog;
