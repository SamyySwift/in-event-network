
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, BarChart4 } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Poll } from "@/hooks/useAdminPolls";

interface PollCardProps {
  poll: Poll;
  isDeleting: boolean;
  onEdit: (poll: Poll) => void;
  onDelete: (poll: Poll) => void;
  onToggleActive: (poll: Poll) => void;
  onToggleShowResults: (poll: Poll) => void;
}

const PollCard: React.FC<PollCardProps> = ({
  poll,
  isDeleting,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleShowResults
}) => {
  const totalVotes = poll.options.reduce((acc, o) => acc + (o.votes || 0), 0);

  const calculatePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{poll.question}</CardTitle>
          <CardDescription className="text-xs mt-1">
            Created: {format(new Date(poll.created_at), 'MMM d, yyyy')}
          </CardDescription>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onEdit(poll)}
                >
                  <Edit size={16} />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Poll</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this poll? This action cannot be undone and will remove all associated votes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(poll)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {poll.is_active && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
          )}
          {poll.show_results && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Results Visible</Badge>
          )}
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {totalVotes} votes
          </Badge>
        </div>
        <div className="space-y-3 mt-4">
          {poll.options.map((option) => (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{option.text}</span>
                <span className="font-medium">{calculatePercentage(option.votes || 0)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-indigo-400 transition-all"
                  style={{ width: `${calculatePercentage(option.votes || 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 border-t pt-3">
        <div className="flex items-center space-x-2">
          <Switch 
            id={`active-${poll.id}`}
            checked={poll.is_active}
            onCheckedChange={() => onToggleActive(poll)}
          />
          <Label htmlFor={`active-${poll.id}`} className="text-sm">Active</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id={`results-${poll.id}`}
            checked={poll.show_results}
            onCheckedChange={() => onToggleShowResults(poll)}
          />
          <Label htmlFor={`results-${poll.id}`} className="text-sm">Show Results</Label>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PollCard;
