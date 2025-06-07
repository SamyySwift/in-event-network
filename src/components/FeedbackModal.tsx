
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  type?: 'event' | 'general';
}

const FeedbackModal = ({ isOpen, onClose, eventId, type = 'general' }: FeedbackModalProps) => {
  const [satisfaction, setSatisfaction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !satisfaction) return;

    setIsSubmitting(true);
    try {
      // Submit as a suggestion instead since we removed the feedback table
      const { error } = await supabase
        .from('suggestions')
        .insert([
          {
            user_id: currentUser.id,
            content: `Satisfaction: ${satisfaction}/5\n\nFeedback: ${feedback}`,
            type: 'feedback',
            event_id: eventId,
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });

      onClose();
      setSatisfaction('');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your experience with this {type}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="satisfaction">How satisfied are you? (1-5)</Label>
            <RadioGroup value={satisfaction} onValueChange={setSatisfaction}>
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value.toString()} id={`satisfaction-${value}`} />
                  <Label htmlFor={`satisfaction-${value}`} className="flex-1">
                    {value} {value === 1 ? '(Very Dissatisfied)' : value === 5 ? '(Very Satisfied)' : ''}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!satisfaction || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
