
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Poll } from "@/hooks/usePolls";
import { useToast } from "@/hooks/use-toast";

interface FloatingPollBannerProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
  onClose: () => void;
  hasUserVoted?: boolean;
  userVote?: string;
}

const FloatingPollBanner: React.FC<FloatingPollBannerProps> = ({
  poll,
  onVote,
  onClose,
  hasUserVoted = false,
  userVote
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        title: "Selection required",
        description: "Please select an option before voting",
        variant: "destructive"
      });
      return;
    }

    onVote(poll.id, selectedOption);
  };

  const calculatePercentage = (votes: number) => {
    const totalVotes = poll.options.reduce((acc, option) => acc + (option.votes || 0), 0);
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const showResults = poll.show_results || hasUserVoted;

  return (
    <Card className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 shadow-lg animate-slide-up z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{poll.question}</CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 rounded-full" 
            onClick={onClose}
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <CardDescription className="text-xs">
          Active poll - Vote now!
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        {!showResults ? (
          <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-2">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    {option.text}
                    {option.id === userVote && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Your vote
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{calculatePercentage(option.votes || 0)}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${option.id === userVote ? 'bg-primary' : 'bg-primary/70'}`}
                    style={{ width: `${calculatePercentage(option.votes || 0)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Total votes: {poll.options.reduce((acc, option) => acc + (option.votes || 0), 0)}
            </p>
          </div>
        )}
      </CardContent>
      {!showResults && poll.is_active && (
        <CardFooter className="pt-0">
          <Button onClick={handleVote} className="w-full">Vote</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FloatingPollBanner;
