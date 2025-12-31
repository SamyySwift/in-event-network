import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Users, 
  Megaphone, 
  BarChart, 
  MapPin, 
  Ticket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const slides = [
  {
    title: 'Welcome to Your Dashboard!',
    description: 'Let\'s take a quick tour of the key features that will help you manage your events successfully.',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    title: 'Create & Manage Events',
    description: 'Start by creating your first event. Add event details, upload banners, and set up registration dates. You can manage multiple events from your dashboard.',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Attendee Management',
    description: 'View registered attendees, manage check-ins, and export attendee data. Use QR code scanning for fast check-in at the venue.',
    icon: Users,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Engage Your Audience',
    description: 'Send announcements, create live polls, manage Q&A sessions, and run interactive games to keep attendees engaged throughout your event.',
    icon: Megaphone,
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Schedule & Speakers',
    description: 'Build your event schedule with sessions, breaks, and activities. Add speaker profiles with photos, bios, and session assignments.',
    icon: BarChart,
    color: 'from-pink-500 to-rose-600',
  },
  {
    title: 'Facilities & Tickets',
    description: 'Set up venue facilities with locations and contact info. Create ticket types with pricing and manage sales through your wallet.',
    icon: Ticket,
    color: 'from-violet-500 to-purple-600',
  },
];

export const AdminOnboardingModal: React.FC<AdminOnboardingModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentUser } = useAuth();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    if (currentUser?.id) {
      await supabase
        .from('profiles')
        .update({ has_seen_admin_guide: true })
        .eq('id', currentUser.id);
    }
    onOpenChange(false);
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] border-0 p-0 overflow-hidden">
        <div className={`bg-gradient-to-br ${slide.color} p-8 text-white`}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-10 w-10" />
            </div>
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-white mb-2">
              {slide.title}
            </DialogTitle>
            <p className="text-white/90 leading-relaxed">
              {slide.description}
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 bg-background">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex gap-2">
              {currentSlide > 0 && (
                <Button variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              {isLastSlide ? (
                <Button onClick={handleComplete} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Get Started
                </Button>
              ) : (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminOnboardingModal;
