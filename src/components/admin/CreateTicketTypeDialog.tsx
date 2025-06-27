
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

interface CreateTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTicketTypeDialog({ open, onOpenChange }: CreateTicketTypeDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { createTicketType } = useAdminTickets();
  const { selectedEventId } = useAdminEventContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId || !name || !price) return;

    createTicketType.mutate({
      event_id: selectedEventId,
      name,
      description: description || undefined,
      price: parseInt(price) || 0,
      max_quantity: maxQuantity ? parseInt(maxQuantity) : undefined,
      available_quantity: parseInt(availableQuantity) || 0,
      is_active: isActive,
    });

    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setMaxQuantity('');
    setAvailableQuantity('');
    setIsActive(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Ticket Type</DialogTitle>
          <DialogDescription>
            Add a new ticket type for your event. You can set pricing, limits, and availability.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Ticket Name *</Label>
              <Input
                id="name"
                placeholder="e.g., General Admission, VIP, Early Bird"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this ticket includes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="availableQuantity">Available Quantity *</Label>
                <Input
                  id="availableQuantity"
                  type="number"
                  placeholder="100"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxQuantity">Max Quantity per Purchase</Label>
              <Input
                id="maxQuantity"
                type="number"
                placeholder="Leave empty for no limit"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Active (available for purchase)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTicketType.isPending}>
              {createTicketType.isPending ? 'Creating...' : 'Create Ticket Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
