import { useState } from 'react';
import { Plus, Ticket, DollarSign, Users, CheckCircle } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { CreateTicketTypeDialog } from '@/components/admin/CreateTicketTypeDialog';
import { TicketsTable } from '@/components/admin/TicketsTable';
import { ShareableTicketLink } from '@/components/admin/ShareableTicketLink';
import { AdminWallet } from '@/components/admin/AdminWallet';

export default function AdminTickets() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { ticketTypes, eventTickets, isLoadingTypes, isLoadingTickets, stats } = useAdminTickets();

  if (isLoadingTypes || isLoadingTickets) {
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
              <Ticket className="w-6 h-6 text-white" />
            </span>
            <div>
              <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Tickets</div>
              <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                Manage ticket types and view sales
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket Type
          </Button>
        </div>

        {/* Admin Wallet Section */}
        <AdminWallet />

        {/* Shareable Link Card */}
        <ShareableTicketLink />

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
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.checkedInTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0}% attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Types</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ticketTypes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Types */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketTypes.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No ticket types created</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first ticket type to start selling tickets
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket Type
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ticketTypes.map((ticketType) => (
                  <Card key={ticketType.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{ticketType.name}</CardTitle>
                        <Badge variant={ticketType.is_active ? "default" : "secondary"}>
                          {ticketType.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {ticketType.description && (
                        <p className="text-sm text-muted-foreground">{ticketType.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Price:</span>
                          <span className="font-semibold">₦{ticketType.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Available:</span>
                          <span>{ticketType.available_quantity}</span>
                        </div>
                        {ticketType.max_quantity && (
                          <div className="flex justify-between">
                            <span className="text-sm">Max Quantity:</span>
                            <span>{ticketType.max_quantity}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketsTable tickets={eventTickets} />
          </CardContent>
        </Card>

        <CreateTicketTypeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
