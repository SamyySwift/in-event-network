import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart2 } from 'lucide-react';
import type { Poll } from '@/hooks/useAttendeePolls';

interface PollPopupProps {
  isOpen: boolean;
  poll: Poll | null;
  onClose: () => void;
  onSkip?: () => void;
  onSubmitVote: (pollId: string, optionId: string) => void;
  allowDismiss?: boolean; // when require_submission is true this should be false
  userVoteOptionId?: string | null; // if user already voted
}

export function PollPopup({
  isOpen,
  poll,
  onClose,
  onSkip,
  onSubmitVote,
  allowDismiss = false,
  userVoteOptionId = null,
}: PollPopupProps) {
  // Hooks must be called unconditionally
  const [selected, setSelected] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!poll) return null;
  const isCompulsory = !!poll.require_submission;

  const handleSubmit = async () => {
    if (!selected || isSubmitting || !!userVoteOptionId) return;
    setIsSubmitting(true);
    try {
        await Promise.resolve(onSubmitVote(poll.id, selected));
    } catch (e) {
        // 提交失败，允许重试
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (allowDismiss) onClose();
          // if not allowed, ignore close attempts
        }
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-md w-full p-0 overflow-hidden rounded-xl">
        <div className="flex flex-col max-h-[90dvh] sm:max-h-[85vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 pb-3 border-b sticky top-0 z-10 bg-white/95 backdrop-blur">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-xl">New Poll</span>
              {isCompulsory && (
                <Badge className="ml-2 bg-gradient-to-r from-red-500 to-orange-400 text-white">Required</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 sm:px-6 pt-4 pb-20 sm:pb-6 overflow-y-auto overscroll-contain">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.question}</h3>
              </div>

              {!userVoteOptionId ? (
                <RadioGroup
                  value={selected}
                  onValueChange={setSelected}
                  className="space-y-3"
                >
                  {poll.options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.id} id={`${poll.id}-${opt.id}`} />
                      <Label htmlFor={`${poll.id}-${opt.id}`}>{opt.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-sm text-muted-foreground">
                  You’ve already voted on this poll.
                </div>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t sticky bottom-0 z-10 bg-white/95 backdrop-blur">
            <div className="flex flex-col sm:flex-row gap-2">
              {isCompulsory ? (
                <>
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                    onClick={handleSubmit}
                    disabled={!selected || !!userVoteOptionId}
                  >
                    Submit Answer
                  </Button>
                </>
              ) : (
                <>
                  {!userVoteOptionId && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
                      onClick={handleSubmit}
                      disabled={!selected || !!userVoteOptionId || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      onSkip?.();
                      onClose();
                    }}
                  >
                    {userVoteOptionId ? 'Close' : 'Skip'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}