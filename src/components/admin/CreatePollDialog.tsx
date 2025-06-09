
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { useAdminPolls } from '@/hooks/useAdminPolls';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';

interface CreatePollDialogProps {
  children: React.ReactNode;
}

const CreatePollDialog: React.FC<CreatePollDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isActive, setIsActive] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  const { selectedEventId } = useAdminEventContext();
  const { createPoll, isCreating } = useAdminPolls(selectedEventId || undefined);
  const { toast } = useToast();

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!selectedEventId) {
      toast({
        title: "No Event Selected",
        description: "Please select an event before creating a poll",
        variant: "destructive"
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a poll question",
        variant: "destructive"
      });
      return;
    }

    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) {
      toast({
        title: "Options required",
        description: "Please provide at least 2 options",
        variant: "destructive"
      });
      return;
    }

    const pollData = {
      question: question.trim(),
      options: filteredOptions.map((text, index) => ({
        id: `option_${index + 1}`,
        text: text.trim()
      })),
      is_active: isActive,
      show_results: showResults,
      event_id: selectedEventId
    };

    createPoll(pollData);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setIsActive(true);
    setShowResults(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus size={16} className="mr-1" />
                Add Option
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">Make poll active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="results"
                checked={showResults}
                onCheckedChange={setShowResults}
              />
              <Label htmlFor="results">Show results immediately</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isCreating || !selectedEventId} 
              className="flex-1"
            >
              {isCreating ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
