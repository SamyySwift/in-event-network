
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
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState(1);
  const [includeFeesInPrice, setIncludeFeesInPrice] = useState(false);
  const [serviceFeePercentage, setServiceFeePercentage] = useState(5.0);
  const [gatewayFeePercentage, setGatewayFeePercentage] = useState(1.5);
  const [gatewayFixedFee, setGatewayFixedFee] = useState(100);
  const [requiresLogin, setRequiresLogin] = useState(true);

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

  // Calculate fee breakdown
  const calculateFees = (basePrice: number) => {
    if (ticketType === 'free' || basePrice === 0) {
      return {
        displayPrice: 0,
        organizerReceives: 0,
        serviceFee: 0,
        gatewayFee: 0,
        totalFees: 0
      };
    }

    const serviceFee = Math.round(basePrice * serviceFeePercentage / 100);
    const gatewayFee = Math.round(basePrice * gatewayFeePercentage / 100) + gatewayFixedFee;
    const totalFees = serviceFee + gatewayFee;

    if (includeFeesInPrice) {
      // Fees are added on top - attendee pays more, organizer gets full base price
      return {
        displayPrice: basePrice + totalFees,
        organizerReceives: basePrice,
        serviceFee,
        gatewayFee,
        totalFees
      };
    } else {
      // Organizer absorbs fees - attendee pays base price, organizer gets less
      return {
        displayPrice: basePrice,
        organizerReceives: basePrice - totalFees,
        serviceFee,
        gatewayFee,
        totalFees
      };
    }
  };

  const currentPrice = parseFloat(price) || 0;
  const feeBreakdown = calculateFees(currentPrice * 100); // Convert to kobo

  const resetForm = () => {
    setSelectedTicketName('');
    setCustomName('');
    setDescription('');
    setTicketType('free');
    setPrice('');
    setAvailableQuantity('');
    setIsActive(true);
    setShouldOpenFormBuilder(false);
    setMaxTicketsPerUser(1);
    setIncludeFeesInPrice(false);
    setServiceFeePercentage(5.0);
    setGatewayFeePercentage(1.5);
    setGatewayFixedFee(100);
    setRequiresLogin(true);
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

    const ticketPrice = ticketType === 'free' ? 0 : parseFloat(price) * 100 || 0; // Convert to kobo
    const quantity = parseInt(availableQuantity) || 0;

    try {
      const result = await createTicketType.mutateAsync({
        name: ticketName,
        description: description.trim() || undefined,
        price: ticketPrice,
        max_quantity: 1, // Fixed as per requirements
        available_quantity: quantity,
        max_tickets_per_user: maxTicketsPerUser,
        is_active: isActive,
        event_id: selectedEventId,
        include_fees_in_price: includeFeesInPrice,
        service_fee_percentage: serviceFeePercentage,
        payment_gateway_fee_percentage: gatewayFeePercentage,
        payment_gateway_fixed_fee: gatewayFixedFee * 100, // Convert to kobo
        requires_login: requiresLogin,
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
                onClick={() => setTicketType('paid')}
                className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  ticketType === 'paid'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ToggleRight className="w-4 h-4" />
                Paid
              </button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-700">
                💡 <strong>Paid tickets are now enabled!</strong> You can create both free and paid tickets using Paystack payment processing.
              </p>
            </div>
          </div>

          {/* Price (only show if paid) */}
          {ticketType === 'paid' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Ticket Price (₦)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="1000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="1"
                  className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
                />
              </div>

              {/* Fee Management Toggle */}
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-blue-900">Include Fees in Ticket Price</Label>
                    <p className="text-xs text-blue-700 mt-1">
                      Choose how to handle service charges and payment gateway fees
                    </p>
                  </div>
                  <Switch
                    checked={includeFeesInPrice}
                    onCheckedChange={setIncludeFeesInPrice}
                  />
                </div>

                {/* Fee Configuration */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-blue-800">Service Fee (%)</Label>
                      <Input
                        type="number"
                        value={serviceFeePercentage}
                        onChange={(e) => setServiceFeePercentage(parseFloat(e.target.value) || 5.0)}
                        min="0"
                        max="10"
                        step="0.1"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-blue-800">Gateway Fee (%)</Label>
                      <Input
                        type="number"
                        value={gatewayFeePercentage}
                        onChange={(e) => setGatewayFeePercentage(parseFloat(e.target.value) || 1.5)}
                        min="0"
                        max="5"
                        step="0.1"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-blue-800">Gateway Fixed Fee (₦)</Label>
                    <Input
                      type="number"
                      value={gatewayFixedFee}
                      onChange={(e) => setGatewayFixedFee(parseInt(e.target.value) || 100)}
                      min="0"
                      step="10"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Fee Breakdown */}
                {currentPrice > 0 && (
                  <div className="bg-white p-3 rounded-lg border space-y-2">
                    <h4 className="text-xs font-medium text-blue-900 mb-2">Pricing Breakdown</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Attendee pays:</span>
                        <span className="font-medium">₦{(feeBreakdown.displayPrice / 100).toFixed(2)}</span>
                      </div>
                      {includeFeesInPrice && (
                        <>
                          <div className="flex justify-between text-red-600">
                            <span>Service fee ({serviceFeePercentage}%):</span>
                            <span>-₦{(feeBreakdown.serviceFee / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Gateway fee:</span>
                            <span>-₦{(feeBreakdown.gatewayFee / 100).toFixed(2)}</span>
                          </div>
                          <hr className="my-1" />
                        </>
                      )}
                      <div className="flex justify-between font-medium text-green-600">
                        <span>You receive:</span>
                        <span>₦{(feeBreakdown.organizerReceives / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`text-xs p-2 rounded-lg ${includeFeesInPrice ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                  {includeFeesInPrice 
                    ? `✅ Fees are added on top. Attendees pay ₦${(feeBreakdown.displayPrice / 100).toFixed(2)} and you receive ₦${currentPrice}.`
                    : `⚠️ You absorb all fees. Attendees pay ₦${currentPrice} and you receive ₦${(feeBreakdown.organizerReceives / 100).toFixed(2)}.`
                  }
                </div>
              </div>
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

          {/* Purchase Method */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              🔐 Purchase Method
            </Label>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-amber-900">Require Login to Purchase</Label>
                  <p className="text-xs text-amber-700 mt-1">
                    {requiresLogin 
                      ? "Users must create an account and login to buy tickets"
                      : "Users can purchase tickets as guests without creating an account"
                    }
                  </p>
                </div>
                <Switch
                  checked={requiresLogin}
                  onCheckedChange={setRequiresLogin}
                />
              </div>
              <div className={`text-xs p-2 rounded-lg ${requiresLogin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {requiresLogin 
                  ? "✅ Default method: Users must login. Tickets appear in their dashboard."
                  : "🎟️ Guest method: No login required. Users get downloadable ticket after purchase."
                }
              </div>
            </div>
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
