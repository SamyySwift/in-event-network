
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

interface CreateTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated?: (ticketType: { id: string; name: string }) => void;
}

const ticketNameOptions = [
  'General Admission',
  'VIP',
  'Early Bird',
  'Backstage Pass',
  'Custom'
];

export function CreateTicketTypeDialog({ open, onOpenChange, onTicketCreated }: CreateTicketTypeDialogProps) {
  const [selectedTicketName, setSelectedTicketName] = useState('');
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [shouldOpenFormBuilder, setShouldOpenFormBuilder] = useState(false);

  const { createTicketType } = useAdminTickets();
  const { adminEvents, selectedEventId: contextEventId } = useAdminEventContext();

  // Auto-select the current event if available
  React.useEffect(() => {
    if (contextEventId && !selectedEventId) {
      setSelectedEventId(contextEventId);
    }
  }, [contextEventId, selectedEventId]);

  const getTicketName = () => {
    return selectedTicketName === 'Custom' ? customName : selectedTicketName;
  };

  const resetForm = () => {
    setSelectedTicketName('');
    setCustomName('');
    setDescription('');
    setTicketType('free');
    setPrice('');
    setAvailableQuantity('');
    setIsActive(true);
    setShouldOpenFormBuilder(false);
    // Keep the selected event if it's from context
    if (!contextEventId) {
      setSelectedEventId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketName = getTicketName();
    if (!ticketName.trim()) {
      return;
    }

    if (!selectedEventId) {
      return;
    }

    const ticketPrice = ticketType === 'free' ? 0 : parseFloat(price) || 0;
    const quantity = parseInt(availableQuantity) || 0;

    try {
      const result = await createTicketType.mutateAsync({
        name: ticketName,
        description: description.trim() || undefined,
        price: ticketPrice,
        max_quantity: 1, // Fixed as per requirements
        available_quantity: quantity,
        is_active: isActive,
        event_id: selectedEventId,
      });
      
      onOpenChange(false);
      
      // If user clicked "Add Form to Ticket", notify parent to open form builder
      if (shouldOpenFormBuilder && onTicketCreated && result) {
        onTicketCreated({ id: result.id, name: ticketName });
      }
      
      resetForm();
    } catch (error) {
      console.error('Error creating ticket type:', error);
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
            Create New Ticket Type
          </DialogTitle>
          <DialogDescription>
            Set up a new ticket type for your event with pricing and availability options.
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
                onClick={() => setTicketType('free')}
                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  ticketType === 'free'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ToggleLeft className="w-4 h-4" />
                Free
              </button>
              <button
                type="button"
                disabled={true}
                className="flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                title="Paid tickets are currently disabled"
              >
                <ToggleRight className="w-4 h-4" />
                Paid (Disabled)
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-sm text-amber-700">
                💡 <strong>Paid tickets are currently disabled.</strong> Only free tickets can be created at this time.
              </p>
            </div>
          </div>

          {/* Price (only show if paid) */}
          {ticketType === 'paid' && (
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

          {/* Max Quantity Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm text-blue-700">
              <strong>Max Quantity per Purchase:</strong> 1 (Fixed)
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

          {/* Add Form to Ticket Section */}
          <div className="border-t pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Custom Form Fields</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add custom fields to collect additional information during ticket purchase
                  </p>
                </div>
                <Button 
                  type="button"
                  variant={shouldOpenFormBuilder ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShouldOpenFormBuilder(!shouldOpenFormBuilder)}
                  className="rounded-xl"
                >
                  {shouldOpenFormBuilder ? '✓ Form Builder Selected' : 'Add Form to Ticket'}
                </Button>
              </div>
              <div className={`rounded-xl p-3 border ${shouldOpenFormBuilder ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-xs ${shouldOpenFormBuilder ? 'text-green-700' : 'text-amber-700'}`}>
                  {shouldOpenFormBuilder 
                    ? '✅ Form builder will open automatically after ticket creation' 
                    : '📝 Custom form fields can be added after the ticket type is created. You\'ll see the form builder option in your ticket management section.'}
                </p>
              </div>
            </div>
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
              disabled={createTicketType.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {createTicketType.isPending ? 'Creating...' : 'Create Ticket Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
