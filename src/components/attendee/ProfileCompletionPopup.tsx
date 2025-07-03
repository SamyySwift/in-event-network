import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Users, ArrowRight, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileCompletionPopup({ isOpen, onClose }: ProfileCompletionPopupProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [completionScore, setCompletionScore] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      const fields = {
        'Profile Photo': currentUser.photoUrl,
        'Bio': currentUser.bio,
        'Company/Niche': currentUser.niche,
        'LinkedIn': currentUser.links?.linkedin,
        'Twitter': currentUser.links?.twitter,
      };

      const completed = Object.values(fields).filter(Boolean).length;
      const total = Object.keys(fields).length;
      const score = Math.round((completed / total) * 100);
      
      setCompletionScore(score);
      setMissingFields(
        Object.entries(fields)
          .filter(([_, value]) => !value)
          .map(([key, _]) => key)
      );
    }
  }, [currentUser]);

  const handleCompleteProfile = () => {
    navigate('/attendee/profile');
    onClose();
  };

  const handleRemindLater = () => {
    // Set a flag to remind later (you can implement this with localStorage)
    localStorage.setItem('profileReminderDismissed', Date.now().toString());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              Complete Your Profile
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Completion Score */}
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionScore}, 100`}
                  strokeLinecap="round"
                  fill="transparent"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">{completionScore}%</span>
              </div>
            </div>
            <p className="text-gray-600">Profile Completion</p>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-purple-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">Connect with Other Attendees</span>
            </div>
            <p className="text-sm text-gray-600">
              A complete profile helps other attendees discover and connect with you based on shared interests and professional background.
            </p>
          </div>

          {/* Missing Fields */}
          {missingFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Complete these fields:</h4>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefits List */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Appear in networking suggestions</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Get better connection requests</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Build meaningful professional relationships</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleCompleteProfile}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Complete Profile Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRemindLater}
              className="w-full"
            >
              Remind Me Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}