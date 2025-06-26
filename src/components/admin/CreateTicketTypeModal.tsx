import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTickets } from '@/hooks/useTickets';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Loader2 } from 'lucide-react';

interface CreateTicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketTypeModal: React.FC<CreateTicketTypeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    available_quantity: '',
    max_quantity: ''
  });
  
  const { selectedEventId } = useAdminEventContext();
  const { createTicketType } = useTickets();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) return;
    
    try {
      await createTicketType.mutateAsync({
        event_id: selectedEventId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        available_quantity: parseInt(formData.available_quantity),
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : undefined
      });
      
      setFormData({
        name: '',
        description: '',
        price: '',
        available_quantity: '',
        max_quantity: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating ticket type:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Ticket Type</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ticket Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., VIP Access, General Admission"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this ticket includes..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="available_quantity">Available Quantity</Label>
            <Input
              id="available_quantity"
              type="number"
              min="1"
              value={formData.available_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, available_quantity: e.target.value }))}
              placeholder="Number of tickets available"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="max_quantity">Max Quantity Per Person (Optional)</Label>
            <Input
              id="max_quantity"
              type="number"
              min="1"
              value={formData.max_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, max_quantity: e.target.value }))}
              placeholder="Maximum tickets per person"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createTicketType.isPending}
            >
              {createTicketType.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Ticket Type
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketTypeModal;