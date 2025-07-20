
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
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberAuth } from '@/hooks/useTeamMemberAuth';
import { toast } from 'sonner';
import { DASHBOARD_SECTIONS } from '@/hooks/useTeamManagement';
import type { Database } from '@/integrations/supabase/types';

type DashboardSection = Database['public']['Enums']['dashboard_section'];

interface InvitationData {
  id: string;
  email: string;
  event_id: string;
  admin_id: string;
  allowed_sections: DashboardSection[];
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
  const { currentUser } = useAuth();
  const { acceptInvitation } = useTeamMemberAuth();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    // If user is already logged in and we have invitation data, process it
    if (currentUser && invitation && !isProcessing) {
      handleExistingUser();
    }
  }, [currentUser, invitation]);

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
        .in('status', ['pending', 'accepted'])
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

  const handleExistingUser = async () => {
    if (!invitation || !currentUser || isProcessing) return;

    setIsProcessing(true);
    try {
      await acceptInvitation(invitation);
      toast.success('Welcome to the team! Redirecting to dashboard...');
      navigate('/admin/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    setIsProcessing(true);
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
        // Wait for auth state to be established, then the useEffect will handle invitation acceptance
        toast.success('Account created successfully! Setting up your team access...');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      setIsProcessing(false);
    }
  };

  const getSectionLabel = (value: DashboardSection) => {
    return DASHBOARD_SECTIONS.find(s => s.value === value)?.label || value;
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

  // Show processing state for existing users
  if (currentUser && isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Setting up your team access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already logged in but not processing, show the acceptance form
  if (currentUser) {
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

            <Button 
              onClick={handleExistingUser}
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Setting Up Access...
                </>
              ) : (
                'Accept Invitation & Access Dashboard'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show signup form for new users
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
              disabled={isProcessing || !formData.name || !formData.password}
            >
              {isProcessing ? (
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
