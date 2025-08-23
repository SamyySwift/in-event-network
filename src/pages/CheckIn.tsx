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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CheckInResponse {
  success: boolean;
  message: string;
  ticket?: {
    ticket_number: string;
    attendee_name: string;
  };
}

interface EventStats {
  totalTickets: number;
  checkedInTickets: number;
  pendingTickets: number;
  attendanceRate: number;
}

function CheckIn() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [foundTickets, setFoundTickets] = useState<any[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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

  // Get event tickets using public function
  const { data: eventTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['public-event-tickets', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase.rpc('get_event_tickets_for_checkin', {
        target_event_id: eventId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  // Get event stats using public function
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['public-event-stats', eventId],
    queryFn: async () => {
      if (!eventId) return { totalTickets: 0, checkedInTickets: 0, pendingTickets: 0, attendanceRate: 0 };
      
      const { data, error } = await supabase.rpc('get_event_checkin_stats', {
        target_event_id: eventId
      });
      
      if (error) throw error;
      return (data as unknown as EventStats) || { totalTickets: 0, checkedInTickets: 0, pendingTickets: 0, attendanceRate: 0 };
    },
    enabled: !!eventId,
  });

  // Get recent check-ins from eventTickets
  const recentCheckIns = eventTickets
    .filter(ticket => ticket.check_in_status)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
    .slice(0, 10);

  // Public check-in mutation
  const checkInTicket = useMutation({
    mutationFn: async ({ searchQuery, notes }: { searchQuery: string; notes?: string }) => {
      if (!eventId) throw new Error('Event ID not provided');
      
      const { data, error } = await supabase.rpc('checkin_ticket_public', {
        target_event_id: eventId,
        search_query: searchQuery,
        notes_text: notes || null
      });
      
      if (error) throw error;
      const result = data as unknown as CheckInResponse;
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-event-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['public-event-stats'] });
      toast({
        title: "Success",
        description: `${data.ticket?.attendee_name || 'Attendee'} checked in successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to check in ticket",
        variant: "destructive",
      });
    },
  });

  // Public QR check-in mutation
  const checkInByQR = useMutation({
    mutationFn: async (qrData: string) => {
      if (!eventId) throw new Error('Event ID not provided');
      
      const { data, error } = await supabase.rpc('checkin_ticket_by_qr_public', {
        target_event_id: eventId,
        qr_data: qrData
      });
      
      if (error) throw error;
      const result = data as unknown as CheckInResponse;
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['public-event-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['public-event-stats'] });
      toast({
        title: "QR Check-in Success",
        description: `${data.ticket?.attendee_name || 'Attendee'} checked in successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "QR Check-in Failed",
        description: error.message || "Failed to check in via QR code",
        variant: "destructive",
      });
    },
  });

  // Search for ticket by name or ticket number
  const { data: searchResults, isLoading: isSearching, refetch: searchTicket } = useQuery({
    queryKey: ['public-search-ticket', searchQuery, eventId],
    queryFn: async () => {
      if (!searchQuery.trim() || !eventId) return null;
      
      // Use the public function to search for tickets
      const { data, error } = await supabase.rpc('get_event_tickets_for_checkin', {
        target_event_id: eventId
      });
      
      if (error) throw error;
      
      // Filter tickets based on search query
      if (searchQuery.startsWith('TKT-')) {
        return (data || []).filter(ticket => ticket.ticket_number === searchQuery);
      } else {
        const searchTerm = searchQuery.toLowerCase();
        return (data || []).filter(ticket => 
          ticket.guest_name?.toLowerCase().includes(searchTerm) ||
          ticket.profile_name?.toLowerCase().includes(searchTerm)
        );
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

  const handleCheckInTicket = (ticket: any) => {
    checkInTicket.mutate({ 
      searchQuery: ticket.ticket_number, 
      notes: notes.trim() || undefined 
    }, {
      onSuccess: () => {
        // Update the local state to reflect check-in status
        setFoundTickets(prev => prev.map(t => 
          t.id === ticket.id 
            ? { ...t, check_in_status: true, checked_in_at: new Date().toISOString() }
            : t
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
    toast({
      title: "Feature Not Available",
      description: "Bulk check-in is only available for authenticated admin users",
      variant: "destructive",
    });
  };

  if (isLoadingEvent || isLoadingTickets || isLoadingStats) {
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

  // Use stats from the hook instead of local ticketStats

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
              disabled={true}
              variant="outline"
              className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              size="lg"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Bulk Check-In (Admin Only)
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
                <div className="text-2xl font-bold text-foreground">{stats?.totalTickets || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.checkedInTickets || 0}</div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.pendingTickets || 0}
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
                  {stats?.attendanceRate || 0}%
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
                                      <h5 className="font-medium text-sm">{ticket.guest_name || ticket.profile_name || 'N/A'}</h5>
                                      <p className="text-xs text-muted-foreground">#{ticket.ticket_number}</p>
                                      <p className="text-xs text-muted-foreground">{ticket.ticket_type_name}</p>
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
                                          onClick={() => handleCheckInTicket(ticket)}
                                          disabled={checkInTicket.isPending}
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
                            <p className="text-sm text-red-600">No ticket found matching "{searchQuery}"</p>
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

            {/* Recent Check-ins */}
            <Card className="rounded-xl border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTickets ? (
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
                            <p className="font-medium text-sm">{checkIn.guest_name || checkIn.profile_name || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{checkIn.ticket_type_name}</p>
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