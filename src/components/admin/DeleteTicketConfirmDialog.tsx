import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { Trash2 } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
}

interface DeleteTicketConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketType: TicketType | null;
}

export function DeleteTicketConfirmDialog({ open, onOpenChange, ticketType }: DeleteTicketConfirmDialogProps) {
  const { deleteTicketType } = useAdminTickets();

  const handleDelete = async () => {
    if (!ticketType) return;
    
    try {
      await deleteTicketType.mutateAsync(ticketType.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting ticket type:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Delete Ticket Type
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete the ticket type <strong>"{ticketType?.name}"</strong>? 
            This action cannot be undone and will remove the ticket from the event and database.
            <br /><br />
            <span className="text-red-600 font-medium">
              ⚠️ This will also remove the ticket from public view and make it inaccessible to attendees.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTicketType.isPending}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            {deleteTicketType.isPending ? 'Deleting...' : 'Delete Ticket'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}