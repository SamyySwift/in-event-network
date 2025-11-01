
import React, { useState } from 'react';
import { QrCode, Scan, Ticket, Users, CheckCircle, Clock, UserCheck, Search, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import QRCodeScanner from '@/components/QRCodeScanner';
import TicketVerifier from '@/components/admin/TicketVerifier';
import ShareableCheckInLink from '@/components/admin/ShareableCheckInLink';
import CSVImportDialog from '@/components/admin/CSVImportDialog';
import { useAdminCheckIns } from '@/hooks/useAdminCheckIns';
import { useAdminTickets } from '@/hooks/useAdminTickets';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { DownloadDataButtons } from '@/components/admin/DownloadDataButtons';

function AdminCheckInContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [foundTickets, setFoundTickets] = useState<any[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const { selectedEventId } = useAdminEventContext();
  const { checkInTicket, checkInTicketById, checkInByQR, isCheckingIn, bulkCheckInAll, isBulkCheckingIn } = useAdminCheckIns();
  const { eventTickets, isLoadingTickets, stats } = useAdminTickets();
  const queryClient = useQueryClient();

  // Fetch event details for export
  const { data: eventData } = useQuery({
    queryKey: ['event-details', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null;
      const { data, error } = await supabase
        .from('events')
        .select('name')
        .eq('id', selectedEventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventId
  });

  // Fetch attendees for export
  const { data: attendeesData = [] } = useQuery({
    queryKey: ['event-attendees', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          id,
          user_id,
          created_at,
          joined_at,
          profiles!fk_event_participants_user_id (
            id,
            name,
            email,
            role
          )
        `)
        .eq('event_id', selectedEventId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedEventId
  });

  // Search for ticket by name or ticket number
  const { data: searchResults, isLoading: isSearching, refetch: searchTicket } = useQuery({
    queryKey: ['search-ticket', searchQuery, selectedEventId],
    queryFn: async () => {
      if (!searchQuery.trim() || !selectedEventId) return null;
      
      // Check if searchQuery looks like a ticket number (starts with TKT-)
      if (searchQuery.startsWith('TKT-')) {
        const { data, error } = await supabase
          .from('event_tickets')
          .select(`
            *,
            ticket_types (
              name,
              description
            ),
            events (
              name,
              start_time,
              location
            ),
            profiles!event_tickets_user_id_fkey (
              name,
              email
            )
          `)
          .eq('event_id', selectedEventId)
          .eq('ticket_number', searchQuery);
        
        if (error) throw error;
        return data;
      } else {
        // Search by guest name or profile name - do separate queries and combine
        const searchTerm = `%${searchQuery}%`;
        
        // Search by guest name
        const { data: guestResults, error: guestError } = await supabase
          .from('event_tickets')
          .select(`
            *,
            ticket_types (
              name,
              description
            ),
            events (
              name,
              start_time,
              location
            ),
            profiles!event_tickets_user_id_fkey (
              name,
              email
            )
          `)
          .eq('event_id', selectedEventId)
          .ilike('guest_name', searchTerm);

        // Search by profile name
        const { data: profileResults, error: profileError } = await supabase
          .from('event_tickets')
          .select(`
            *,
            ticket_types (
              name,
              description
            ),
            events (
              name,
              start_time,
              location
            ),
            profiles!event_tickets_user_id_fkey (
              name,
              email
            )
          `)
          .eq('event_id', selectedEventId)
          .not('profiles', 'is', null);

        if (guestError && profileError) {
          throw guestError || profileError;
        }

        // Filter profile results by name match
        const filteredProfileResults = (profileResults || []).filter(ticket => 
          ticket.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Combine and deduplicate results
        const allResults = [...(guestResults || []), ...filteredProfileResults];
        const uniqueResults = allResults.filter((ticket, index, self) => 
          index === self.findIndex(t => t.id === ticket.id)
        );

        return uniqueResults;
      }
    },
    enabled: false, // We'll trigger this manually
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchAttempted(true);
    const result = await searchTicket();
    if (result.data && result.data.length > 0) {
      setFoundTickets(result.data);
    } else {
      setFoundTickets([]);
    }
  };

  const handleCheckInTicket = (ticketId: string) => {
    checkInTicketById.mutate({ 
      ticketId, 
      notes: notes.trim() || undefined 
    }, {
      onSuccess: () => {
        // Update the local state to reflect check-in status
        setFoundTickets(prev => prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, check_in_status: true, checked_in_at: new Date().toISOString() }
            : ticket
        ));
      }
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFoundTickets([]);
    setSearchAttempted(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQRScan = (qrData: string) => {
    checkInByQR.mutate(qrData);
    setShowScanner(false);
  };

  const handleBulkCheckIn = () => {
    if (confirm('Are you sure you want to check in all remaining tickets? This action cannot be undone.')) {
      bulkCheckInAll.mutate();
    }
  };

  const recentCheckIns = eventTickets
    .filter(ticket => ticket.check_in_status)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
    .slice(0, 10);

  if (isLoadingTickets) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
        {/* Modern Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-lg">
              <QrCode className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-In</div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Scan QR codes or manual entry
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                ✨ Checking in tickets now grants attendees dashboard access
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
            <ShareableCheckInLink />
            {/* Replace window reload with query invalidation */}
            <CSVImportDialog
              onImportComplete={() => {
                if (selectedEventId) {
                  queryClient.invalidateQueries({ queryKey: ['admin-event-tickets', selectedEventId] });
                } else {
                  queryClient.invalidateQueries({ queryKey: ['admin-event-tickets'] });
                }
              }}
            />
            <Button 
              onClick={handleBulkCheckIn}
              disabled={isBulkCheckingIn || stats.totalTickets === stats.checkedInTickets}
              variant="outline"
              className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
              size="lg"
            >
              <UserCheck className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {isBulkCheckingIn ? 'Checking In All...' : 'Bulk Check-In All'}
              </span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTickets}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.checkedInTickets}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalTickets - stats.checkedInTickets}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Data Section */}
        <DownloadDataButtons 
          attendees={attendeesData} 
          eventName={eventData?.name || 'Event'} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Check-In Methods */}
          <Card className="rounded-xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Check-In Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* QR Scanner */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">QR Code Scanner</h3>
                  <Button
                    onClick={() => setShowScanner(!showScanner)}
                    variant={showScanner ? "destructive" : "default"}
                    className="rounded-xl transition-all duration-200"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {showScanner ? "Stop Scanner" : "Start Scanner"}
                  </Button>
                </div>
                
                {showScanner && (
                  <div className="border rounded-xl p-4 bg-muted/30">
                    <QRCodeScanner
                      onScanSuccess={handleQRScan}
                      onScanError={(error) => console.error('QR scan error:', error)}
                      width="100%"
                      height="300px"
                    />
                  </div>
                )}
              </div>

              {/* Manual Check-In */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">Manual Check-In</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchQuery" className="text-sm font-medium">Ticket Number or Attendee Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="searchQuery"
                        placeholder="Enter ticket number (TKT-xxx) or attendee name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="rounded-xl"
                      />
                      <Button 
                        onClick={handleSearch}
                        disabled={!searchQuery.trim() || isSearching}
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Ticket Search Results */}
                  {searchAttempted && (
                    <div className="border rounded-xl p-4 bg-muted/30">
                      {isSearching ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                        </div>
                      ) : foundTickets.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">
                              {foundTickets.length === 1 ? "Ticket Found" : `${foundTickets.length} Tickets Found`}
                            </h4>
                            <Button
                              onClick={handleClearSearch}
                              variant="outline"
                              size="sm"
                              className="rounded-lg"
                            >
                              Clear
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {foundTickets.map((ticket) => (
                              <div key={ticket.id} className="border rounded-lg p-4 bg-background/50 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <h5 className="font-medium text-sm">{ticket.guest_name || ticket.profiles?.name || 'N/A'}</h5>
                                    <p className="text-xs text-muted-foreground">#{ticket.ticket_number}</p>
                                    <p className="text-xs text-muted-foreground">{ticket.ticket_types.name}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={ticket.check_in_status ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {ticket.check_in_status ? "Checked In" : "Pending"}
                                    </Badge>
                                    {!ticket.check_in_status && (
                                      <Button
                                        onClick={() => handleCheckInTicket(ticket.id)}
                                        disabled={isCheckingIn}
                                        size="sm"
                                        className="rounded-lg"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Check In
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  <div>
                                    <strong>Price:</strong> ₦{(ticket.price / 100).toLocaleString()}
                                  </div>
                                  <div>
                                    <strong>Purchased:</strong> {formatDate(ticket.purchase_date)}
                                  </div>
                                  {ticket.checked_in_at && (
                                    <div className="col-span-2">
                                      <strong>Checked in:</strong> {formatDate(ticket.checked_in_at)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-red-600">No tickets found matching "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {foundTickets.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Notes for Next Check-in (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes that will be applied to the next ticket check-in..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="rounded-xl resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        These notes will be saved with each individual ticket check-in.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Check-Ins */}
          <Card className="rounded-xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Check-Ins</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentCheckIns.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {ticket.guest_name || ticket.profiles?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {ticket.ticket_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.ticket_types.name}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="default" className="mb-2 rounded-lg">
                          ✓ Checked In
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {ticket.checked_in_at && new Date(ticket.checked_in_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
}

export default AdminCheckInContent;
