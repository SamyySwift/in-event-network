
import React, { useState } from 'react';
import { Plus, Ticket, DollarSign, Users, CheckCircle, Edit, Trash2, FormInput, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateTicketTypeDialog } from '@/components/admin/CreateTicketTypeDialog';
import { EditTicketTypeDialog } from '@/components/admin/EditTicketTypeDialog';
import { EditTicketTypeFormDialog } from '@/components/admin/EditTicketTypeFormDialog';
import { DeleteTicketConfirmDialog } from '@/components/admin/DeleteTicketConfirmDialog';
import { TicketsTable } from '@/components/admin/TicketsTable';
import { ShareableTicketLink } from '@/components/admin/ShareableTicketLink';
import { WithdrawalButton } from '@/components/admin/WithdrawalButton';

import { useAdminTickets } from '@/hooks/useAdminTickets';

function AdminTicketsContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);

  const { 
    ticketTypes, 
    eventTickets, 
    isLoadingTypes,
    isLoadingTickets,
    stats
  } = useAdminTickets();

  

  if (isLoadingTypes || isLoadingTickets) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Stats are now coming directly from the hook

  const handleTicketCreated = (ticketType: { id: string; name: string }) => {
    setCreateDialogOpen(false);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Modern Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ticket Management
              </h1>
              <p className="text-muted-foreground">
                Manage ticket types, sales, and withdrawals
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-green-600">₦{(stats.totalRevenue / 100).toLocaleString()}</div>
            </div>
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-muted-foreground">Sold</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTickets}</div>
            </div>
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-muted-foreground">Checked In</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.checkedInTickets}</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0}% rate
              </div>
            </div>
            <div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span className="text-sm text-muted-foreground">Types</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.ticketTypes}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Ticket Type
              </Button>
            </div>
            <ShareableTicketLink />
          </div>
        </div>

        <div className="space-y-8">
          {/* Ticket Types Section */}
          <Card className="rounded-xl border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  Ticket Types
                </CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {ticketTypes.length} types
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {ticketTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No ticket types created</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Create your first ticket type to start selling tickets and earning revenue
                  </p>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Ticket Type
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {ticketTypes.map((ticketType) => (
                    <Card key={ticketType.id} className="rounded-xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold truncate">{ticketType.name}</CardTitle>
                            <Badge 
                              variant={ticketType.is_active ? "default" : "secondary"} 
                              className={`mt-2 ${ticketType.is_active ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                            >
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
                            <span className="font-bold text-lg text-green-600">₦{(ticketType.price / 100).toLocaleString()}</span>
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

          {/* Tickets Table Section */}
          <Card className="rounded-xl border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Tickets
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Complete list of all ticket purchases and their status
              </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <TicketsTable tickets={eventTickets} />
              </div>
            </CardContent>
          </Card>
        </div>

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
    </div>
  );
}

export default AdminTicketsContent;
