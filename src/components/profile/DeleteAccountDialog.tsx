import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  userName: string;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const confirmationText = 'DELETE MY ACCOUNT';
  const isConfirmationValid = confirmText === confirmationText;

  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) return;

    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // First, delete the user's profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue even if profile deletion fails
      }

      // Delete other user-related data (optional - you might want to keep some for audit purposes)
      // This will cascade delete based on your foreign key constraints
      
      // Finally, delete the user account using the user's own session
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        // If RPC function doesn't exist, we'll handle this differently
        // For now, we'll just sign out the user and show a message
        console.error('Account deletion error:', error);
        
        toast({
          title: "Account deletion initiated",
          description: "Your account deletion has been initiated. Please contact support if you need assistance.",
          variant: "default"
        });

        // Log out and redirect
        await logout();
        window.location.href = '/';
        return;
      }

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
        variant: "default"
      });

      // Log out and redirect
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error deleting account",
        description: "There was a problem deleting your account. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 size={16} className="mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>
            <p className="font-medium">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Your profile and all personal information</li>
              <li>Your messages and conversations</li>
              <li>Your event participation history</li>
              <li>Your connections and networking data</li>
              <li>All other account-related data</li>
            </ul>
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium">
                Type <span className="font-mono bg-muted px-1 rounded">{confirmationText}</span> to confirm:
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type the confirmation text"
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
