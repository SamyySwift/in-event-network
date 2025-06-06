import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  MessageSquare,
  MapPin,
  Bell,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeOnboarding = () => {
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();
  const { toast } = useToast();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [niche, setNiche] = useState(currentUser?.niche || '');
  const [twitterLink, setTwitterLink] = useState(currentUser?.links?.twitter || '');
  const [linkedinLink, setLinkedinLink] = useState(currentUser?.links?.linkedin || '');
  const [websiteLink, setWebsiteLink] = useState(currentUser?.links?.website || '');

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    navigate('/attendee');
    toast({
      title: 'Welcome to EventConnect!',
      description: 'You can complete your profile later in the Profile section.',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateUser({
        bio,
        niche,
        links: {
          ...(currentUser?.links || {}),
          twitter: twitterLink,
          linkedin: linkedinLink,
          website: websiteLink,
        },
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated!',
      });

      navigate('/attendee');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasEventAccess = getJoinedEvents().length > 0;

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to EventConnect!</h1>
            <p className="text-muted-foreground">
              Let's set up your profile to help you make the most of your networking experience.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>
                  This information helps others know who you are and what you do.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself, your background, and your interests..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Professional Focus / Interests</Label>
                  <Input
                    id="niche"
                    placeholder="e.g., Frontend Development, AI Research, Product Management"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Connect your social profiles</CardTitle>
                <CardDescription>
                  Add your social media links to make it easier for others to connect with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/yourusername"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Personal Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>You're all set!</CardTitle>
                <CardDescription>
                  Here's what you can do with EventConnect as an attendee.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-connect-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">View Event Schedule</h3>
                      <p className="text-sm text-muted-foreground">
                        Access the full schedule of sessions, workshops, and activities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-connect-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Network with Attendees</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with other participants, exchange contact information, and build your network.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-connect-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Ask Questions</h3>
                      <p className="text-sm text-muted-foreground">
                        Submit questions to speakers and participate in Q&A sessions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-connect-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Navigate the Venue</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the interactive map to find your way around the event venue.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Bell className="h-5 w-5 text-connect-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Stay Updated</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about schedule changes, announcements, and more.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-connect-600 hover:bg-connect-700"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      Complete Setup <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeOnboarding;
