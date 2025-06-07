
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
import { usePolls } from '@/hooks/usePolls';
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
  const [displayAsBanner, setDisplayAsBanner] = useState(false);
  
  const { createPoll, isCreating } = usePolls();
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

    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const pollData = {
      question: question.trim(),
      options: filteredOptions.map((text, index) => ({
        id: `option_${index + 1}`,
        text: text.trim()
      })),
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      is_active: isActive,
      show_results: showResults,
      display_as_banner: displayAsBanner
    };

    createPoll(pollData);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setIsActive(true);
    setShowResults(false);
    setDisplayAsBanner(false);
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

            <div className="flex items-center space-x-2">
              <Switch
                id="banner"
                checked={displayAsBanner}
                onCheckedChange={setDisplayAsBanner}
              />
              <Label htmlFor="banner">Display as banner</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;
