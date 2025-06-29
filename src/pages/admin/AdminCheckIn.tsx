
import React, { useState } from 'react';
import { QrCode, Scan, Ticket, Users, CheckCircle, Clock, UserCheck } from 'lucide-react';
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
  
  const { checkInTicket, checkInByQR, isCheckingIn, bulkCheckInAll, isBulkCheckingIn } = useAdminCheckIns();
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
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
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
                    <Label htmlFor="ticketNumber" className="text-sm font-medium">Ticket Number</Label>
                    <Input
                      id="ticketNumber"
                      placeholder="Enter ticket number (e.g., TKT-20240101-1234)"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                      className="rounded-xl"
                    />
                  </div>
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
                  <Button 
                    onClick={handleManualCheckIn}
                    disabled={!ticketNumber.trim() || isCheckingIn}
                    className="w-full rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    {isCheckingIn ? 'Checking In...' : 'Check In Ticket'}
                  </Button>
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
    </AdminLayout>
  );
}
