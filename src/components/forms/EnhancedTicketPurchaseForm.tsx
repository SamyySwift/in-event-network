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
    <div className="space-y-6">
      {/* Ticket Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Select Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 mr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{ticketType.name}</h4>
                  {ticketType.price > 0 ? (
                    <Badge variant="default">₦{((ticketType.display_price || ticketType.price) / 100).toLocaleString()}</Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </div>
                {ticketType.description && (
                  <p className="text-sm text-muted-foreground mb-2">{ticketType.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{Math.max(0, ticketType.available_quantity - (selectedTickets[ticketType.id] || 0))} remaining</span>
                  <span>Max {ticketType.max_tickets_per_user} per user</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) - 1)}
                  disabled={(selectedTickets[ticketType.id] || 0) <= 0}
                >
                  -
                </Button>
                <span className="w-8 text-center">{selectedTickets[ticketType.id] || 0}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) + 1)}
                  disabled={(selectedTickets[ticketType.id] || 0) >= Math.min(ticketType.max_tickets_per_user, ticketType.available_quantity)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Attendee Information */}
      {purchaseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {purchaseData.map((purchase, purchaseIndex) => {
              const ticketType = ticketTypes.find(t => t.id === purchase.ticketTypeId);
              if (!ticketType) return null;

              return (
                <div key={purchase.ticketTypeId} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{ticketType.name}</h4>
                    <Badge variant="outline">{purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}</Badge>
                  </div>

                  {purchase.attendees.map((attendee, attendeeIndex) => (
                    <div key={attendeeIndex} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {attendeeIndex === 0 ? 'Primary Attendee' : `Attendee ${attendeeIndex + 1}`}
                        </span>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`firstName-${purchaseIndex}-${attendeeIndex}`}>
                            First Name *
                          </Label>
                          <Input
                            id={`firstName-${purchaseIndex}-${attendeeIndex}`}
                            value={attendee.firstName}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'firstName', e.target.value)}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lastName-${purchaseIndex}-${attendeeIndex}`}>
                            Last Name *
                          </Label>
                          <Input
                            id={`lastName-${purchaseIndex}-${attendeeIndex}`}
                            value={attendee.lastName}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'lastName', e.target.value)}
                            placeholder="Enter last name"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${purchaseIndex}-${attendeeIndex}`}>
                            Email Address *
                          </Label>
                          <Input
                            id={`email-${purchaseIndex}-${attendeeIndex}`}
                            type="email"
                            value={attendee.email}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'email', e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phone-${purchaseIndex}-${attendeeIndex}`}>
                            Phone Number
                          </Label>
                          <Input
                            id={`phone-${purchaseIndex}-${attendeeIndex}`}
                            type="tel"
                            value={attendee.phone || ''}
                            onChange={(e) => updateAttendeeInfo(purchaseIndex, attendeeIndex, 'phone', e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* Custom Form Fields */}
                      {ticketType.formFields && ticketType.formFields.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-4">
                            <h5 className="font-medium text-sm">Additional Information</h5>
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

      {/* Purchase Summary */}
      {getTotalTickets() > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Tickets:</span>
                <span className="font-medium">{getTotalTickets()}</span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span>Total Price:</span>
                <span>₦{(getTotalPrice() / 100).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}