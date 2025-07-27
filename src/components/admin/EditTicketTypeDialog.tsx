import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Ticket, DollarSign, Hash, ToggleLeft, ToggleRight } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_quantity?: number;
  available_quantity: number;
  is_active: boolean;
  event_id: string;
}

interface EditTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketType: TicketType | null;
}

const ticketNameOptions = [
  'General Admission',
  'VIP',
  'Early Bird',
  'Backstage Pass',
  'Custom'
];

export function EditTicketTypeDialog({ open, onOpenChange, ticketType }: EditTicketTypeDialogProps) {
  const [selectedTicketName, setSelectedTicketName] = useState('');
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [ticketTypeState, setTicketTypeState] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState(1);

  const { updateTicketType } = useAdminTickets();
  const { adminEvents } = useAdminEventContext();

  // Populate form when ticketType changes
  useEffect(() => {
    if (ticketType) {
      // Determine if it's a preset name or custom
      const isPresetName = ticketNameOptions.includes(ticketType.name);
      if (isPresetName) {
        setSelectedTicketName(ticketType.name);
        setCustomName('');
      } else {
        setSelectedTicketName('Custom');
        setCustomName(ticketType.name);
      }
      
      setDescription(ticketType.description || '');
      setTicketTypeState(ticketType.price > 0 ? 'paid' : 'free');
      setPrice(ticketType.price?.toString() || '0');
      setAvailableQuantity(ticketType.available_quantity?.toString() || '0');
      setMaxTicketsPerUser((ticketType as any).max_tickets_per_user || 1);
      setIsActive(ticketType.is_active);
      setSelectedEventId(ticketType.event_id);
    }
  }, [ticketType]);

  const getTicketName = () => {
    return selectedTicketName === 'Custom' ? customName : selectedTicketName;
  };

  const resetForm = () => {
    setSelectedTicketName('');
    setCustomName('');
    setDescription('');
    setTicketTypeState('free');
    setPrice('');
    setAvailableQuantity('');
    setIsActive(true);
    setSelectedEventId('');
    setMaxTicketsPerUser(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketType) return;
    
    const ticketName = getTicketName();
    if (!ticketName.trim()) {
      return;
    }

    if (!selectedEventId) {
      return;
    }

    const ticketPrice = ticketTypeState === 'free' ? 0 : parseFloat(price) || 0;
    const quantity = parseInt(availableQuantity) || 0;

    try {
      await updateTicketType.mutateAsync({
        id: ticketType.id,
        name: ticketName,
        description: description.trim() || undefined,
        price: ticketPrice,
        max_quantity: 1, // Fixed as per requirements
        available_quantity: quantity,
        max_tickets_per_user: maxTicketsPerUser,
        is_active: isActive,
        event_id: selectedEventId,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error updating ticket type:', error);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ticket className="w-5 h-5 text-primary" />
            Edit Ticket Type
          </DialogTitle>
          <DialogDescription>
            Update the ticket type details for your event.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event" className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Event
            </Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="rounded-xl border-2 transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {adminEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Name */}
          <div className="space-y-2">
            <Label htmlFor="ticketName" className="text-sm font-medium flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Ticket Name
            </Label>
            <Select value={selectedTicketName} onValueChange={setSelectedTicketName}>
              <SelectTrigger className="rounded-xl border-2 transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Choose ticket name" />
              </SelectTrigger>
              <SelectContent>
                {ticketNameOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTicketName === 'Custom' && (
              <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                <Input
                  placeholder="Enter custom ticket name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this ticket type"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50 min-h-[80px] resize-none"
            />
          </div>

          {/* Ticket Type (Free/Paid) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ticket Type
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTicketTypeState('free')}
                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  ticketTypeState === 'free'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ToggleLeft className="w-4 h-4" />
                Free
              </button>
              <button
                type="button"
                onClick={() => setTicketTypeState('paid')}
                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  ticketTypeState === 'paid'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ToggleRight className="w-4 h-4" />
                Paid
              </button>
            </div>
          </div>

          {/* Price (only show if paid) */}
          {ticketTypeState === 'paid' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (₦)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
              />
            </div>
          )}

          {/* Available Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Available Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="100"
              value={availableQuantity}
              onChange={(e) => setAvailableQuantity(e.target.value)}
              min="1"
              className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
            />
          </div>

          {/* Max Tickets Per User */}
          <div className="space-y-2">
            <Label htmlFor="maxTicketsPerUser" className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Max Tickets Per User
            </Label>
            <Input
              id="maxTicketsPerUser"
              type="number"
              placeholder="1"
              value={maxTicketsPerUser}
              onChange={(e) => setMaxTicketsPerUser(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of tickets one user can purchase at a time (1-10)
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <Label htmlFor="active" className="text-sm font-medium">
                Active Status
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Inactive tickets won't be available for purchase
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateTicketType.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {updateTicketType.isPending ? 'Updating...' : 'Update Ticket Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}