import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { QrCode, Scan, Ticket, Users, CheckCircle, Clock, UserCheck, Search, Calendar, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import QRCodeScanner from '@/components/QRCodeScanner';
import { useAdminCheckIns } from '@/hooks/useAdminCheckIns';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function CheckIn() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [foundTicket, setFoundTicket] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const { checkInTicket, checkInByQR, isCheckingIn, bulkCheckInAll, isBulkCheckingIn } = useAdminCheckIns();
  
  // Get event details
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['shared-event', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID not provided');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Get ticket stats for this event
  const { data: ticketStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['shared-event-stats', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID not provided');
      
      const { data: tickets, error } = await supabase
        .from('event_tickets')
        .select('id, check_in_status, checked_in_at')
        .eq('event_id', eventId);
      
      if (error) throw error;
      
      const totalTickets = tickets.length;
      const checkedInTickets = tickets.filter(t => t.check_in_status).length;
      
      return {
        totalTickets,
        checkedInTickets,
      };
    },
    enabled: !!eventId,
  });

  // Get recent check-ins
  const { data: recentCheckIns, isLoading: isLoadingCheckIns } = useQuery({
    queryKey: ['shared-recent-checkins', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID not provided');
      
      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          ticket_types (name),
          profiles!event_tickets_user_id_fkey (name)
        `)
        .eq('event_id', eventId)
        .eq('check_in_status', true)
        .order('checked_in_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Search for ticket by name or ticket number
  const { data: searchResults, isLoading: isSearching, refetch: searchTicket } = useQuery({
    queryKey: ['shared-search-ticket', searchQuery, eventId],
    queryFn: async () => {
      if (!searchQuery.trim() || !eventId) return null;
      
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
          .eq('event_id', eventId)
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
          .eq('event_id', eventId)
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
          .eq('event_id', eventId)
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
      setFoundTicket(result.data[0]);
    } else {
      setFoundTicket(null);
    }
  };

  const handleCheckInFound = () => {
    if (!foundTicket) return;
    
    checkInTicket.mutate({ 
      searchQuery: foundTicket.ticket_number, 
      notes: notes.trim() || undefined 
    });
    
    // Clear form on success
    setSearchQuery('');
    setNotes('');
    setFoundTicket(null);
    setSearchAttempted(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFoundTicket(null);
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

  if (isLoadingEvent || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const stats = ticketStats || { totalTickets: 0, checkedInTickets: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Event Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{event.name}</h1>
          <p className="text-muted-foreground">Event Check-In Portal</p>
          {event.location && (
            <p className="text-sm text-muted-foreground mt-1">📍 {event.location}</p>
          )}
        </div>

        <div className="space-y-6">
          {/* Modern Section Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shadow-lg">
                <QrCode className="w-5 h-5 text-white" />
              </span>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-In</div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Scan QR codes or manual entry
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  ✨ Checking in tickets now grants attendees dashboard access
                </p>
              </div>
            </div>
            <Button 
              onClick={handleBulkCheckIn}
              disabled={isBulkCheckingIn || stats.totalTickets === stats.checkedInTickets}
              variant="outline"
              className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {isBulkCheckingIn ? 'Checking In All...' : 'Bulk Check-In All'}
            </Button>
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
                        ) : foundTicket ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground">Ticket Found</h4>
                              <Badge 
                                variant={foundTicket.check_in_status ? "default" : "secondary"}
                              >
                                {foundTicket.check_in_status ? "Already Checked In" : "Ready for Check-in"}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-center space-y-1">
                                <h5 className="font-medium">{foundTicket.events?.name || event.name}</h5>
                                <p className="text-sm text-muted-foreground">{foundTicket.ticket_types?.name}</p>
                                <p className="text-xs text-muted-foreground">#{foundTicket.ticket_number}</p>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(foundTicket.events?.start_time || event.start_time)}</span>
                                </div>
                                {(foundTicket.events?.location || event.location) && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{foundTicket.events?.location || event.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{foundTicket.guest_name || foundTicket.profiles?.name || 'N/A'}</span>
                                </div>
                                <div>
                                  <strong>Price:</strong> ₦{(foundTicket.price / 100).toLocaleString()}
                                </div>
                                {foundTicket.checked_in_at && (
                                  <div>
                                    <strong>Checked in:</strong> {formatDate(foundTicket.checked_in_at)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-red-600">No ticket found matching "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {foundTicket && (
                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about this check-in..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="rounded-xl resize-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {foundTicket && !foundTicket.check_in_status && (
                        <Button 
                          onClick={handleCheckInFound}
                          disabled={isCheckingIn}
                          className="flex-1 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                          size="lg"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {isCheckingIn ? 'Checking In...' : 'Check In Ticket'}
                        </Button>
                      )}
                      {(foundTicket || searchAttempted) && (
                        <Button 
                          onClick={handleClearSearch}
                          variant="outline"
                          className="rounded-xl"
                          size="lg"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCheckIns ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading recent check-ins...</p>
                  </div>
                ) : recentCheckIns && recentCheckIns.length > 0 ? (
                  <div className="space-y-3">
                    {recentCheckIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{checkIn.guest_name || checkIn.profiles?.name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{checkIn.ticket_types?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(checkIn.checked_in_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No check-ins yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckIn;