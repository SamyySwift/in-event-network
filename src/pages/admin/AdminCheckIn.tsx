
import React, { useState } from 'react';
import { QrCode, Scan, Ticket, Users, CheckCircle, Clock } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import QRCodeScanner from '@/components/QRCodeScanner';
import { useAdminCheckIns } from '@/hooks/useAdminCheckIns';
import { useAdminTickets } from '@/hooks/useAdminTickets';

export default function AdminCheckIn() {
  const [ticketNumber, setTicketNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  const { checkInTicket, checkInByQR, isCheckingIn } = useAdminCheckIns();
  const { eventTickets, isLoadingTickets, stats } = useAdminTickets();

  const handleManualCheckIn = () => {
    if (!ticketNumber.trim()) return;
    
    checkInTicket.mutate({ 
      ticketNumber: ticketNumber.trim(), 
      notes: notes.trim() || undefined 
    });
    
    // Clear form on success
    setTicketNumber('');
    setNotes('');
  };

  const handleQRScan = (qrData: string) => {
    checkInByQR.mutate(qrData);
    setShowScanner(false);
  };

  const recentCheckIns = eventTickets
    .filter(ticket => ticket.check_in_status)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
    .slice(0, 10);

  if (isLoadingTickets) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Modern Section Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
              <QrCode className="w-6 h-6 text-white" />
            </span>
            <div>
              <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Check-In</div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                Scan QR codes or manual entry
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.checkedInTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalTickets - stats.checkedInTickets}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check-In Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Check-In Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Scanner */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">QR Code Scanner</h3>
                  <Button
                    onClick={() => setShowScanner(!showScanner)}
                    variant={showScanner ? "destructive" : "default"}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {showScanner ? "Stop Scanner" : "Start Scanner"}
                  </Button>
                </div>
                
                {showScanner && (
                  <div className="border rounded-lg p-4">
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
                <h3 className="text-lg font-semibold">Manual Check-In</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ticketNumber">Ticket Number</Label>
                    <Input
                      id="ticketNumber"
                      placeholder="Enter ticket number (e.g., TKT-20240101-1234)"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this check-in..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={handleManualCheckIn}
                    disabled={!ticketNumber.trim() || isCheckingIn}
                    className="w-full"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    {isCheckingIn ? 'Checking In...' : 'Check In Ticket'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Check-Ins */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-Ins</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCheckIns.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {ticket.guest_name || ticket.profiles?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.ticket_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.ticket_types.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default" className="mb-1">
                          Checked In
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
    </AdminLayout>
  );
}
