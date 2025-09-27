import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Users, Ticket } from 'lucide-react';
import { CustomFormRenderer } from '@/components/forms/CustomFormRenderer';
import { FormField } from '@/hooks/useTicketFormFields';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  max_tickets_per_user: number;
  is_active: boolean;
  formFields?: FormField[];
  display_price?: number;
  organizer_receives?: number;
  include_fees_in_price?: boolean;
}

interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  formResponses?: Record<string, any>;
}

interface TicketPurchaseInfo {
  ticketTypeId: string;
  quantity: number;
  attendees: AttendeeInfo[];
}

interface EnhancedTicketPurchaseFormProps {
  ticketTypes: TicketType[];
  selectedTickets: Record<string, number>;
  onTicketQuantityChange: (ticketTypeId: string, quantity: number) => void;
  onPurchaseDataChange: (purchaseData: TicketPurchaseInfo[]) => void;
  currentUserEmail?: string;
}

export function EnhancedTicketPurchaseForm({
  ticketTypes,
  selectedTickets,
  onTicketQuantityChange,
  onPurchaseDataChange,
  currentUserEmail = ''
}: EnhancedTicketPurchaseFormProps) {
  const [purchaseData, setPurchaseData] = useState<TicketPurchaseInfo[]>([]);

  // Initialize purchase data when selected tickets change
  useEffect(() => {
    const newPurchaseData: TicketPurchaseInfo[] = [];
    
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      if (quantity > 0) {
        const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
        if (ticketType) {
          const attendees: AttendeeInfo[] = [];
          
          // Create attendee info for each ticket
          for (let i = 0; i < quantity; i++) {
            attendees.push({
              firstName: i === 0 ? '' : '', // First ticket can be auto-filled from user
              lastName: i === 0 ? '' : '',
              email: i === 0 ? currentUserEmail : '',
              phone: '',
              formResponses: {}
            });
          }
          
          newPurchaseData.push({
            ticketTypeId,
            quantity,
            attendees
          });
        }
      }
    });
    
    setPurchaseData(newPurchaseData);
  }, [selectedTickets, ticketTypes, currentUserEmail]);

  // Notify parent when purchase data changes
  useEffect(() => {
    onPurchaseDataChange(purchaseData);
  }, [purchaseData, onPurchaseDataChange]);

  const updateAttendeeInfo = (ticketTypeIndex: number, attendeeIndex: number, field: keyof AttendeeInfo, value: any) => {
    setPurchaseData(prev => {
      const newData = [...prev];
      if (newData[ticketTypeIndex] && newData[ticketTypeIndex].attendees[attendeeIndex]) {
        newData[ticketTypeIndex].attendees[attendeeIndex] = {
          ...newData[ticketTypeIndex].attendees[attendeeIndex],
          [field]: value
        };
      }
      return newData;
    });
  };

  const updateFormResponse = (ticketTypeIndex: number, attendeeIndex: number, fieldId: string, value: any) => {
    setPurchaseData(prev => {
      const newData = [...prev];
      if (newData[ticketTypeIndex] && newData[ticketTypeIndex].attendees[attendeeIndex]) {
        const attendee = newData[ticketTypeIndex].attendees[attendeeIndex];
        attendee.formResponses = {
          ...attendee.formResponses,
          [fieldId]: value
        };
      }
      return newData;
    });
  };

  const handleQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) return;

    const maxAllowed = Math.min(ticketType.max_tickets_per_user, ticketType.available_quantity);
    const finalQuantity = Math.max(0, Math.min(newQuantity, maxAllowed));
    
    onTicketQuantityChange(ticketTypeId, finalQuantity);
  };

  const getTotalPrice = () => {
    return purchaseData.reduce((total, purchase) => {
      const ticketType = ticketTypes.find(t => t.id === purchase.ticketTypeId);
      if (ticketType) {
        const ticketPrice = ticketType.display_price || ticketType.price;
        return total + (ticketPrice * purchase.quantity);
      }
      return total;
    }, 0);
  };

  const getTotalTickets = () => {
    return purchaseData.reduce((total, purchase) => total + purchase.quantity, 0);
  };

  return (
    <div className="space-y-8">
      {/* Ultra Modern Ticket Selection */}
      <Card className="glass-card border-primary/20 shadow-2xl backdrop-blur-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Ticket className="w-6 h-6 text-primary-foreground" />
            </div>
            Select Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="group hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between p-6 border border-primary/20 rounded-2xl bg-gradient-to-r from-background/50 to-accent/5 hover:from-primary/5 hover:to-accent/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="flex-1 mr-6">
                  <div className="mb-2">
                    <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                      {ticketType.name}
                    </h4>
                  </div>
                  {ticketType.description && (
                    <p className="text-muted-foreground mb-3 leading-relaxed">{ticketType.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-accent/10 px-3 py-1 rounded-full text-foreground/80 font-medium">
                      {Math.max(0, ticketType.available_quantity - (selectedTickets[ticketType.id] || 0))} remaining
                    </span>
                    <span className="bg-primary/10 px-3 py-1 rounded-full text-foreground/80 font-medium">
                      Max {ticketType.max_tickets_per_user} per user
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="text-center">
                    {ticketType.price > 0 ? (
                      <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg px-4 py-2 shadow-lg">
                        ₦{((ticketType.display_price || ticketType.price) / 100).toLocaleString()}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gradient-to-r from-accent/20 to-primary/20 text-foreground font-bold text-lg px-4 py-2 shadow-lg">
                        Free
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 bg-background/80 p-2 rounded-xl border border-primary/20 shadow-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 rounded-xl bg-gradient-to-r from-background to-accent/10 hover:from-destructive/10 hover:to-destructive/20 border-primary/20 font-bold text-lg"
                      onClick={() => handleQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) - 1)}
                      disabled={(selectedTickets[ticketType.id] || 0) <= 0}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-bold text-xl text-foreground bg-primary/10 py-2 px-3 rounded-lg">
                      {selectedTickets[ticketType.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 rounded-xl bg-gradient-to-r from-background to-accent/10 hover:from-primary/10 hover:to-accent/20 border-primary/20 font-bold text-lg"
                      onClick={() => handleQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) + 1)}
                      disabled={(selectedTickets[ticketType.id] || 0) >= Math.min(ticketType.max_tickets_per_user, ticketType.available_quantity)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ultra Modern Attendee Information */}
      {purchaseData.length > 0 && (
        <Card className="glass-card border-primary/20 shadow-2xl backdrop-blur-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-primary/20">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              Attendee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {purchaseData.map((purchase, purchaseIndex) => {
              const ticketType = ticketTypes.find(t => t.id === purchase.ticketTypeId);
              if (!ticketType) return null;

              return (
                <div key={purchase.ticketTypeId} className="space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <h4 className="font-bold text-lg text-foreground">{ticketType.name}</h4>
                    <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-foreground font-semibold px-3 py-1">
                      {purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {purchase.attendees.map((attendee, attendeeIndex) => (
                    <div key={attendeeIndex} className="p-6 border border-primary/20 rounded-2xl space-y-6 bg-gradient-to-r from-background/50 to-accent/5 hover:from-primary/5 hover:to-accent/10 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {attendeeIndex === 0 ? 'Primary Attendee' : `Attendee ${attendeeIndex + 1}`}
                        </span>
                      </div>

                      {/* Modern Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={`firstName-${purchaseIndex}-${attendeeIndex}`} className="text-foreground font-semibold">
                            First Name *
                          </Label>
                          <Input
                            id={`firstName-${purchaseIndex}-${attendeeIndex}`}
                            value={attendee.firstName}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'firstName', e.target.value)}
                            placeholder="Enter first name"
                            className="border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20 rounded-xl h-12 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`lastName-${purchaseIndex}-${attendeeIndex}`} className="text-foreground font-semibold">
                            Last Name *
                          </Label>
                          <Input
                            id={`lastName-${purchaseIndex}-${attendeeIndex}`}
                            value={attendee.lastName}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'lastName', e.target.value)}
                            placeholder="Enter last name"
                            className="border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20 rounded-xl h-12 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`email-${purchaseIndex}-${attendeeIndex}`} className="text-foreground font-semibold">
                            Email Address *
                          </Label>
                          <Input
                            id={`email-${purchaseIndex}-${attendeeIndex}`}
                            type="email"
                            value={attendee.email}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'email', e.target.value)}
                            placeholder="Enter email address"
                            className="border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20 rounded-xl h-12 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${purchaseIndex}-${attendeeIndex}`} className="text-foreground font-semibold">
                            Phone Number
                          </Label>
                          <Input
                            id={`phone-${purchaseIndex}-${attendeeIndex}`}
                            type="tel"
                            value={attendee.phone || ''}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'phone', e.target.value)}
                            placeholder="Enter phone number"
                            className="border-primary/20 bg-background/50 focus:border-primary focus:ring-primary/20 rounded-xl h-12 font-medium"
                          />
                        </div>
                      </div>

                      {/* Modern Custom Form Fields */}
                      {ticketType.formFields && ticketType.formFields.length > 0 && (
                        <>
                          <Separator className="bg-primary/20" />
                          <div className="space-y-6 p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-primary/10">
                            <h5 className="font-bold text-lg text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              Additional Information
                            </h5>
                            <CustomFormRenderer
                              formFields={ticketType.formFields}
                              values={attendee.formResponses || {}}
                              onChange={(fieldId, value) => {
                                updateFormResponse(purchaseIndex, attendeeIndex, fieldId, value);
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}