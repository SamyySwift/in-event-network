
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCheckIns } from '@/hooks/useCheckIns';
import { useTickets } from '@/hooks/useTickets';
import CheckInScanner from '@/components/admin/CheckInScanner';
import { UserCheck, Search, QrCode, Users, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const AdminCheckIns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual' | 'history'>('scanner');
  const { data: checkIns, isLoading: checkInsLoading } = useCheckIns();
  const { useEventTickets } = useTickets();
  const { data: eventTickets, isLoading: ticketsLoading } = useEventTickets();

  const totalTickets = eventTickets?.length || 0;
  const checkedInTickets = eventTickets?.filter(ticket => ticket.check_in_status).length || 0;
  const pendingTickets = totalTickets - checkedInTickets;
  const checkInRate = totalTickets > 0 ? Math.round((checkedInTickets / totalTickets) * 100) : 0;

  const handleScanResult = (result: string) => {
    console.log('Scanned ticket:', result);
    // Check-in logic will be handled by the CheckInScanner component
  };

  const filteredCheckIns = checkIns?.filter(checkIn => 
    searchTerm === '' || 
    checkIn.ticket?.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checkIn.ticket?.guest_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (checkInsLoading || ticketsLoading) {
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
          <h1 className="text-3xl font-bold">Check-in Management</h1>
          <p className="text-muted-foreground">
            Scan tickets and manage attendee check-ins
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Sold tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{checkedInTickets}</div>
            <p className="text-xs text-muted-foreground">
              Attendees present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTickets}</div>
            <p className="text-xs text-muted-foreground">
              Not checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkInRate}%</div>
            <p className="text-xs text-muted-foreground">
              Attendance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'scanner' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          QR Scanner
        </Button>
        <Button
          variant={activeTab === 'manual' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('manual')}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Manual Check-in
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className="flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          Check-in History
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'scanner' && (
        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            <CheckInScanner onScanResult={handleScanResult} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket number or guest name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {eventTickets
                  ?.filter(ticket => 
                    searchTerm === '' || 
                    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ticket.guest_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{ticket.ticket_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.guest_name || 'Registered User'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ticket.check_in_status ? "default" : "outline"}>
                          {ticket.check_in_status ? "Checked In" : "Pending"}
                        </Badge>
                        {!ticket.check_in_status && (
                          <Button size="sm">
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCheckIns.length > 0 ? (
              <div className="space-y-4">
                {filteredCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{checkIn.ticket?.ticket_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkIn.ticket?.guest_name || 'Registered User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Checked in by admin • {format(new Date(checkIn.checked_in_at), 'PPp')}
                      </p>
                    </div>
                    <Badge variant="default">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No check-ins recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCheckIns;
