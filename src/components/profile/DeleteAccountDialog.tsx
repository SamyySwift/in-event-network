
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

      // Delete user data from all related tables
      // Note: Some deletions may be handled by CASCADE constraints
      
      // Delete chat messages
      const { error: chatError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (chatError) {
        console.error('Error deleting chat messages:', chatError);
      }

      // Delete direct messages (both sent and received)
      const { error: directMessagesError } = await supabase
        .from('direct_messages')
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (directMessagesError) {
        console.error('Error deleting direct messages:', directMessagesError);
      }

      // Delete regular messages (both sent and received)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
      }

      // Delete poll votes
      const { error: pollVotesError } = await supabase
        .from('poll_votes')
        .delete()
        .eq('user_id', user.id);

      if (pollVotesError) {
        console.error('Error deleting poll votes:', pollVotesError);
      }

      // Delete questions submitted by user
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('user_id', user.id);

      if (questionsError) {
        console.error('Error deleting questions:', questionsError);
      }

      // Delete suggestions/feedback
      const { error: suggestionsError } = await supabase
        .from('suggestions')
        .delete()
        .eq('user_id', user.id);

      if (suggestionsError) {
        console.error('Error deleting suggestions:', suggestionsError);
      }

      // Delete event tickets
      const { error: ticketsError } = await supabase
        .from('event_tickets')
        .delete()
        .eq('user_id', user.id);

      if (ticketsError) {
        console.error('Error deleting event tickets:', ticketsError);
      }

      // Delete event payments
      const { error: paymentsError } = await supabase
        .from('event_payments')
        .delete()
        .eq('user_id', user.id);

      if (paymentsError) {
        console.error('Error deleting event payments:', paymentsError);
      }

      // Delete admin wallets (if user is an admin)
      const { error: adminWalletsError } = await supabase
        .from('admin_wallets')
        .delete()
        .eq('admin_id', user.id);

      if (adminWalletsError) {
        console.error('Error deleting admin wallets:', adminWalletsError);
      }

      // Delete check-ins performed by user (if admin)
      const { error: checkInsError } = await supabase
        .from('check_ins')
        .delete()
        .eq('admin_id', user.id);

      if (checkInsError) {
        console.error('Error deleting check-ins:', checkInsError);
      }

      // Delete media files uploaded by user
      const { error: mediaError } = await supabase
        .from('media_files')
        .delete()
        .eq('uploaded_by', user.id);

      if (mediaError) {
        console.error('Error deleting media files:', mediaError);
      }

      // Delete events hosted by user
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('host_id', user.id);

      if (eventsError) {
        console.error('Error deleting hosted events:', eventsError);
      }

      // Delete connections
      const { error: connectionError } = await supabase
        .from('connections')
        .delete()
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (connectionError) {
        console.error('Error deleting connections:', connectionError);
      }

      // Delete notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (notificationError) {
        console.error('Error deleting notifications:', notificationError);
      }

      // Delete event participations (this should cascade delete related data)
      const { error: participationError } = await supabase
        .from('event_participants')
        .delete()
        .eq('user_id', user.id);

      if (participationError) {
        console.error('Error deleting event participations:', participationError);
      }

      // Finally, delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw profileError;
      }

      // Delete the user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        console.error('Error deleting auth user:', authError);
        // Continue even if auth deletion fails, as the profile data is already deleted
      }

      toast({
        title: "Account permanently deleted",
        description: "Your account and all associated data have been permanently removed from our system.",
        variant: "default"
      });

      // Sign out the user and redirect
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
