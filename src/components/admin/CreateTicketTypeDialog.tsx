
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Ticket, DollarSign, Users } from 'lucide-react';

interface CreateTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_TICKET_NAMES = [
  'General Admission',
  'VIP',
  'Early Bird',
  'Backstage Pass',
  'Custom'
];

export function CreateTicketTypeDialog({ open, onOpenChange }: CreateTicketTypeDialogProps) {
  const [selectedTicketName, setSelectedTicketName] = useState('');
  const [customName, setCustomName] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { createTicketType } = useAdminTickets();
  const { selectedEventId } = useAdminEventContext();

  const getTicketName = () => {
    return selectedTicketName === 'Custom' ? customName : selectedTicketName;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const ticketName = getTicketName();
    if (!selectedEventId || !ticketName || !availableQuantity) return;

    createTicketType.mutate({
      event_id: selectedEventId,
      name: ticketName,
      description: description || undefined,
      price: ticketType === 'paid' ? parseInt(price) || 0 : 0,
      max_quantity: 1, // Fixed to 1 as requested
      available_quantity: parseInt(availableQuantity) || 0,
      is_active: isActive,
    });

    // Reset form
    setSelectedTicketName('');
    setCustomName('');
    setDescription('');
    setTicketType('free');
    setPrice('');
    setAvailableQuantity('');
    setIsActive(true);
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedTicketName('');
    setCustomName('');
    setDescription('');
    setTicketType('free');
    setPrice('');
    setAvailableQuantity('');
    setIsActive(true);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Create Ticket Type
          </DialogTitle>
          <DialogDescription className="text-base">
            Configure a new ticket type for your event with pricing and availability settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Ticket Name Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="ticketName" className="text-sm font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Ticket Name *
              </Label>
              <Select value={selectedTicketName} onValueChange={setSelectedTicketName}>
                <SelectTrigger className="rounded-lg border-2 transition-all duration-200 hover:border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Choose a ticket type" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_TICKET_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Custom Name Input */}
              {selectedTicketName === 'Custom' && (
                <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                  <Input
                    placeholder="Enter custom ticket name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="rounded-lg border-2 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this ticket includes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-lg border-2 transition-all duration-200 hover:border-primary/50 focus:border-primary resize-none"
              />
            </div>

            {/* Ticket Type (Free/Paid) */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ticket Type *
              </Label>
              <RadioGroup
                value={ticketType}
                onValueChange={(value: 'free' | 'paid') => {
                  setTicketType(value);
                  if (value === 'free') {
                    setPrice('');
                  }
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="font-medium cursor-pointer">
                    Free Event
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="font-medium cursor-pointer">
                    Paid Event
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Price Field (only for paid events) */}
            {ticketType === 'paid' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price (₦) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-10 rounded-lg border-2 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                    required
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Available Quantity */}
            <div className="space-y-2">
              <Label htmlFor="availableQuantity" className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Available Quantity *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="availableQuantity"
                  type="number"
                  placeholder="100"
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(e.target.value)}
                  className="pl-10 rounded-lg border-2 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Max Quantity Info */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Max Quantity per Purchase:</span>
                <span className="font-bold text-primary">1 ticket</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Limited to prevent bulk purchasing by individual attendees
              </p>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                  Active Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Make this ticket type available for purchase
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogChange(false)}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTicketType.isPending || !selectedTicketName || !availableQuantity || (ticketType === 'paid' && !price)}
              className="rounded-lg"
            >
              {createTicketType.isPending ? 'Creating...' : 'Create Ticket Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
