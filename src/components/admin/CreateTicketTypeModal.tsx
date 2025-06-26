import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTickets } from '@/hooks/useTickets';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Loader2 } from 'lucide-react';

interface CreateTicketTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketTypeModal: React.FC<CreateTicketTypeModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    ticketType: '',
    description: '',
    priceType: '',
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
      const ticketPrice = formData.priceType === 'free' ? 0 : parseFloat(formData.price);
      
      await createTicketType.mutateAsync({
        event_id: selectedEventId,
        name: formData.ticketType,
        description: formData.description,
        price: ticketPrice,
        available_quantity: parseInt(formData.available_quantity),
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : undefined
      });
      
      setFormData({
        ticketType: '',
        description: '',
        priceType: '',
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
            <Label htmlFor="ticketType">Ticket Type</Label>
            <Select value={formData.ticketType} onValueChange={(value) => setFormData(prev => ({ ...prev, ticketType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP Access">VIP Access</SelectItem>
                <SelectItem value="General Admission">General Admission</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="priceType">Price Type</Label>
            <Select value={formData.priceType} onValueChange={(value) => setFormData(prev => ({ ...prev, priceType: value, price: value === 'free' ? '0' : '' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select price type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.priceType === 'paid' && (
            <div>
              <Label htmlFor="price">Price Amount (₦)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="Enter price amount"
                required
              />
            </div>
          )}
          
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
            <Label htmlFor="max_quantity">Max Quantity Per Person</Label>
            <Select value={formData.max_quantity} onValueChange={(value) => setFormData(prev => ({ ...prev, max_quantity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select max quantity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createTicketType.isPending || !formData.ticketType || !formData.priceType || (formData.priceType === 'paid' && !formData.price)}
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