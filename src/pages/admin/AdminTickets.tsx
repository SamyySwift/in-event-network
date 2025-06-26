
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTickets } from '@/hooks/useTickets';
import { useAdminWallet } from '@/hooks/useAdminWallet';
import { Ticket, Plus, DollarSign, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

const AdminTickets = () => {
  const { useTicketTypes, useEventTickets } = useTickets();
  const { data: ticketTypes, isLoading: typesLoading } = useTicketTypes();
  const { data: eventTickets, isLoading: ticketsLoading } = useEventTickets();
  const { data: walletData } = useAdminWallet();

  const totalSales = eventTickets?.reduce((sum, ticket) => sum + ticket.price, 0) || 0;
  const totalTicketsSold = eventTickets?.length || 0;

  if (typesLoading || ticketsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ticket Management</h1>
          <p className="text-muted-foreground">
            Manage ticket types and track sales for your events
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket Type
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {walletData?.available_balance && 
                `₦${walletData.available_balance.toLocaleString()} available`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Across all ticket types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketTypes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active ticket categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTicketsSold > 0 
                ? `${Math.round((eventTickets?.filter(t => t.check_in_status).length || 0) / totalTicketsSold * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Attendees checked in
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Types */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketTypes && ticketTypes.length > 0 ? (
            <div className="space-y-4">
              {ticketTypes.map((ticketType) => (
                <div key={ticketType.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{ticketType.name}</h3>
                    <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                    <p className="text-sm font-medium">₦{ticketType.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={ticketType.is_active ? "default" : "secondary"}>
                      {ticketType.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticketType.available_quantity} available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ticket types created yet</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Ticket Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Ticket Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ticket Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {eventTickets && eventTickets.length > 0 ? (
            <div className="space-y-4">
              {eventTickets.slice(0, 10).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{ticket.ticket_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.guest_name || 'Registered User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.purchase_date), 'PPp')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{ticket.price.toLocaleString()}</p>
                    <Badge variant={ticket.check_in_status ? "default" : "outline"}>
                      {ticket.check_in_status ? "Checked In" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tickets sold yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTickets;
