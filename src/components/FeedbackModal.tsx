
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSubmit: (feedback: any) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  questionId, 
  onSubmit 
}) => {
  const handleSubmit = () => {
    // Feedback functionality temporarily disabled
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="text-gray-600 mb-4">Feedback functionality is temporarily unavailable.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
