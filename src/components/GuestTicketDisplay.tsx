import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, MapPin, Ticket, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface GuestTicketDisplayProps {
  tickets: Array<{
    ticket_number: string;
    qr_code_data: string;
    price: number;
    ticket_types?: {
      name: string;
      description?: string;
    } | null;
    guest_name?: string;
    guest_email?: string;
  }>;
  event: {
    name: string;
    start_time: string;
    location?: string;
    banner_url?: string;
  };
  onDownload: () => void;
}

export function GuestTicketDisplay({ tickets, event, onDownload }: GuestTicketDisplayProps) {
  const formatPrice = (price: number) => {
    return `₦${(price / 100).toFixed(2)}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const eventDateTime = formatDateTime(event.start_time);
  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Purchase Successful!</h1>
          <p className="text-gray-600 mt-2">
            Your {tickets.length} ticket{tickets.length > 1 ? 's' : ''} for <strong>{event.name}</strong> {tickets.length > 1 ? 'have' : 'has'} been purchased successfully.
          </p>
        </div>
      </div>

      {/* Purchase Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{event.name}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{eventDateTime.date} at {eventDateTime.time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
            {event.banner_url && (
              <img 
                src={event.banner_url} 
                alt="Event banner" 
                className="w-24 h-16 object-cover rounded-lg"
              />
            )}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount Paid:</span>
              <span className="text-lg font-bold text-green-600">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Tickets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Tickets</h2>
        {tickets.map((ticket, index) => (
          <Card key={ticket.ticket_number} className="border-2 border-dashed border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Ticket Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                  <div>
                      <h3 className="font-semibold text-lg">{ticket.ticket_types?.name || 'Ticket'}</h3>
                      {ticket.ticket_types?.description && (
                        <p className="text-sm text-gray-600 mt-1">{ticket.ticket_types.description}</p>
                      )}
                    </div>
                    <span className="text-lg font-bold">{formatPrice(ticket.price)}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Number:</span>
                      <span className="font-mono font-medium">{ticket.ticket_number}</span>
                    </div>
                    {ticket.guest_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{ticket.guest_name}</span>
                      </div>
                    )}
                    {ticket.guest_email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{ticket.guest_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center space-y-2">
                  <QRCodeSVG 
                    value={ticket.qr_code_data} 
                    size={120}
                    level="M"
                    includeMargin={true}
                  />
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    <span>Scan at venue</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button 
          onClick={onDownload}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Tickets
        </Button>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Save this page or take a screenshot for your records</li>
            <li>• Present your QR code at the event venue for entry</li>
            <li>• Keep your ticket number handy for any inquiries</li>
            <li>• Contact the event organizer if you need any assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}