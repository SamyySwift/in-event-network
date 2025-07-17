
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DASHBOARD_SECTIONS } from '@/hooks/useTeamManagement';

interface InvitationData {
  id: string;
  email: string;
  event_id: string;
  admin_id: string;
  allowed_sections: string[];
  expires_at: string | null;
  event: {
    name: string;
    description: string | null;
  };
  admin: {
    name: string | null;
    email: string | null;
  };
}

export default function TeamSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    fetchInvitation();
  }, [token]);

  useEffect(() => {
    // If user is already logged in, try to accept the invitation
    if (user && invitation && !isSigningUp) {
      acceptInvitation();
    }
  }, [user, invitation]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          event:events!inner(name, description),
          admin:profiles!admin_id(name, email)
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) throw error;

      // Check if invitation is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired');
        return;
      }

      setInvitation(data);
      setFormData(prev => ({ ...prev, email: data.email }));
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    setIsSigningUp(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            name: formData.name,
            team_member_for_event: invitation.event_id
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // Accept the invitation will be handled by the useEffect
        toast.success('Account created successfully! Accepting invitation...');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsSigningUp(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !user) return;

    try {
      // Create team member record
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          admin_id: invitation.admin_id,
          event_id: invitation.event_id,
          allowed_sections: invitation.allowed_sections,
          expires_at: invitation.expires_at,
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      // Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      // Update user's current event and team member status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          current_event_id: invitation.event_id,
          team_member_for_event: invitation.event_id 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Welcome to the team! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  // If user is already logged in and accepting invitation
  if (user && isSigningUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Accepting invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already logged in, show acceptance confirmation
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <CardTitle>Invitation Accepted!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You've successfully joined the team for <strong>{invitation.event.name}</strong>!</p>
            <p>You'll be redirected to the dashboard shortly...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSectionLabel = (value: string) => {
    return DASHBOARD_SECTIONS.find(s => s.value === value)?.label || value;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center">
            <Users className="h-6 w-6 text-blue-500 mr-2" />
            <CardTitle>Join Event Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">You've been invited to join:</h3>
            <p className="text-lg font-medium">{invitation.event.name}</p>
            {invitation.event.description && (
              <p className="text-sm text-muted-foreground mt-1">{invitation.event.description}</p>
            )}
            <p className="text-sm text-blue-700 mt-2">
              Invited by: {invitation.admin.name || invitation.admin.email}
            </p>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center mb-3">
              <Shield className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="font-semibold">Your Dashboard Access</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {invitation.allowed_sections.map((section) => (
                <Badge key={section} variant="outline">
                  {getSectionLabel(section)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Expiration */}
          {invitation.expires_at && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSigningUp || !formData.name || !formData.password}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in here</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
