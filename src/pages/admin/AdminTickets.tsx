import React, { useState } from 'react';
import { Plus, Ticket, DollarSign, Users, CheckCircle, Edit, Trash2, FormInput } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { CreateTicketTypeDialog } from '@/components/admin/CreateTicketTypeDialog';
import { EditTicketTypeDialog } from '@/components/admin/EditTicketTypeDialog';
import { EditTicketTypeFormDialog } from '@/components/admin/EditTicketTypeFormDialog';
import { DeleteTicketConfirmDialog } from '@/components/admin/DeleteTicketConfirmDialog';
import { TicketsTable } from '@/components/admin/TicketsTable';
import { ShareableTicketLink } from '@/components/admin/ShareableTicketLink';
import { AdminWallet } from '@/components/admin/AdminWallet';

export default function AdminTickets() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  
  const { ticketTypes, eventTickets, isLoadingTypes, isLoadingTickets, stats } = useAdminTickets();

  const handleTicketCreated = (ticketType: { id: string; name: string }) => {
    setSelectedTicketType(ticketType);
    setFormDialogOpen(true);
  };

  const handleFormBuilder = (ticketType: any) => {
    setSelectedTicketType(ticketType);
    setFormDialogOpen(true);
  };

  const handleEdit = (ticketType: any) => {
    setSelectedTicketType(ticketType);
    setEditDialogOpen(true);
  };

  const handleDelete = (ticketType: any) => {
    setSelectedTicketType(ticketType);
    setDeleteDialogOpen(true);
  };

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
      <div className="space-y-6 p-4 sm:p-6">
        {/* Modern Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-lg">
              <Ticket className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tickets</div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Manage ticket types and view sales
              </h1>
            </div>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)} 
            className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket Type
          </Button>
        </div>

        {/* Admin Wallet Section */}
        <div className="w-full">
          <AdminWallet />
        </div>

        {/* Shareable Link Card */}
        <div className="w-full">
          <ShareableTicketLink />
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
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0}% attendance
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₦{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Types</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.ticketTypes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Types */}
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ticket Types</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketTypes.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ticket types created</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create your first ticket type to start selling tickets
                </p>
                <Button 
                  onClick={() => setCreateDialogOpen(true)}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket Type
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {ticketTypes.map((ticketType) => (
                  <Card key={ticketType.id} className="rounded-xl border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate">{ticketType.name}</CardTitle>
                          <Badge variant={ticketType.is_active ? "default" : "secondary"} className="mt-2">
                            {ticketType.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFormBuilder(ticketType)}
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg"
                            title="Add Form Fields"
                          >
                            <FormInput className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ticketType)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticketType)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {ticketType.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ticketType.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="font-semibold text-lg">₦{ticketType.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Available:</span>
                          <span className="font-medium">{ticketType.available_quantity}</span>
                        </div>
                        {ticketType.max_quantity && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Max Quantity:</span>
                            <span className="font-medium">{ticketType.max_quantity}</span>
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
        <Card className="rounded-xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Tickets</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <TicketsTable tickets={eventTickets} />
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateTicketTypeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onTicketCreated={handleTicketCreated}
        />
        
        <EditTicketTypeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          ticketType={selectedTicketType}
        />

        <EditTicketTypeFormDialog
          ticketTypeId={selectedTicketType?.id || ''}
          ticketTypeName={selectedTicketType?.name || ''}
          isOpen={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
        />
        
        <DeleteTicketConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          ticketType={selectedTicketType}
        />
      </div>
    </AdminLayout>
  );
}
