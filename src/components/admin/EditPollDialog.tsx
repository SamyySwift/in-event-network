import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { useAdminPolls, Poll } from "@/hooks/useAdminPolls";
import { useToast } from "@/hooks/use-toast";

interface EditPollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: Poll;
}

const EditPollDialog: React.FC<EditPollDialogProps> = ({ open, onOpenChange, poll }) => {
  const { updatePoll, isUpdating } = useAdminPolls(); // will invalidate admin-polls
  const { toast } = useToast();

  // Local editable state
  const [question, setQuestion] = useState(poll.question);
  const [options, setOptions] = useState(poll.options);
  const [isActive, setIsActive] = useState(poll.is_active);
  const [showResults, setShowResults] = useState(poll.show_results);
  const [voteLimit, setVoteLimit] = useState<number | undefined>(
    typeof poll.vote_limit === "number" ? poll.vote_limit : undefined
  );
  const [requireSubmission, setRequireSubmission] = useState(!!poll.require_submission);

  // Reset form when poll changes or dialog reopens
  useEffect(() => {
    setQuestion(poll.question);
    setOptions(poll.options);
    setIsActive(poll.is_active);
    setShowResults(poll.show_results);
    setVoteLimit(typeof poll.vote_limit === "number" ? poll.vote_limit : undefined);
    setRequireSubmission(!!poll.require_submission);
  }, [poll, open]);

  const nextOptionId = useMemo(() => {
    const ids = options
      .map((o) => {
        const m = /^option_(\d+)$/.exec(o.id || "");
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(Boolean);
    const max = ids.length ? Math.max(...ids) : 0;
    return `option_${max + 1}`;
  }, [options]);

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: nextOptionId, text: "" },
    ]);
  };

  const updateOptionText = (index: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast({
        title: "At least 2 options required",
        description: "A poll must have a minimum of 2 options.",
        variant: "destructive",
      });
      return;
    }
    const opt = options[index];
    if (opt.votes && opt.votes > 0) {
      toast({
        title: "Cannot remove option with votes",
        description: "This option already has votes and cannot be removed.",
        variant: "destructive",
      });
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a poll question",
        variant: "destructive",
      });
      return;
    }

    const normalizedOptions = options
      .map((o) => ({ ...o, text: o.text.trim() }))
      .filter((o) => o.text.length > 0);

    if (normalizedOptions.length < 2) {
      toast({
        title: "Options required",
        description: "Please provide at least 2 options",
        variant: "destructive",
      });
      return;
    }

    updatePoll(
      {
        id: poll.id,
        question: question.trim(),
        options: normalizedOptions.map(({ id, text }) => ({ id, text })), // do not push votes back
        is_active: isActive,
        show_results: showResults,
        vote_limit: typeof voteLimit === "number" ? voteLimit : null,
        require_submission: requireSubmission,
      },
      {
        onSuccess: () => {
          toast({ title: "Poll updated", description: "Your changes were saved." });
          onOpenChange(false);
        },
        onError: (e: any) => {
          toast({
            title: "Failed to update",
            description: e?.message || "Please try again.",
            variant: "destructive",
          });
        },
      } as any
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Poll</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              placeholder="Edit your question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" />
                Options with votes cannot be removed
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeOption(index)}
                    disabled={!!option.votes && option.votes > 0}
                    title={
                      option.votes && option.votes > 0
                        ? "Cannot delete option with votes"
                        : "Remove option"
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
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

          <div>
            <Label htmlFor="vote-limit">Vote Limit (optional)</Label>
            <Input
              id="vote-limit"
              type="number"
              placeholder="Enter maximum number of votes (leave empty for unlimited)"
              value={typeof voteLimit === "number" ? voteLimit : ""}
              onChange={(e) =>
                setVoteLimit(e.target.value ? parseInt(e.target.value) : undefined)
              }
              min={1}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Set the maximum number of people who can vote on this poll. Leave empty for unlimited voting.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
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
                id="require-submission"
                checked={requireSubmission}
                onCheckedChange={setRequireSubmission}
              />
              <Label htmlFor="require-submission">
                Require Submission (make pop-up compulsory)
              </Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUpdating} className="flex-1">
              {isUpdating ? "Saving..." : "Update Poll"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPollDialog;