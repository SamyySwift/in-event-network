
import React, { useState } from 'react';
import { Plus, Users, Clock, CheckCircle, FileText, Download, QrCode, Share, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { CreateSponsorFormDialog } from '@/components/admin/CreateSponsorFormDialog';
import { SponsorFormQRCode } from '@/components/admin/SponsorFormQRCode';
import { SponsorsTable } from '@/components/admin/SponsorsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { EditSponsorFormDialog } from '@/components/admin/EditSponsorFormDialog';
import { exportToCSV } from '@/utils/exportUtils';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import PaymentGuard from '@/components/payment/PaymentGuard';

function AdminSponsorsContent() {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingForm, setDeletingForm] = useState<any>(null);
  
  const { selectedEventId, adminEvents, isLoading: isEventLoading, error: eventError } = useAdminEventContext();
  
  const { 
    sponsorForms, 
    sponsors, 
    isLoadingForms, 
    isLoadingSponsors, 
    updateSponsorForm,
    deleteSponsorForm,
    stats 
  } = useAdminSponsors();

  console.log('AdminSponsorsContent - Debug Info:', {
    selectedEventId,
    adminEvents: adminEvents?.length || 0,
    isEventLoading,
    eventError,
    isLoadingForms,
    isLoadingSponsors,
    sponsorFormsCount: sponsorForms?.length || 0,
    sponsorsCount: sponsors?.length || 0
  });

  // Show loading state while events are loading
  if (isEventLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  // Show error state if there's an event loading error
  if (eventError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading events</p>
          <p className="text-sm text-muted-foreground">{eventError.message}</p>
        </div>
      </div>
    );
  }

  // Show message if no events are available
  if (!adminEvents || adminEvents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            You need to create an event first before managing sponsors and partners
          </p>
        </div>
      </div>
    );
  }

  // Show message if no event is selected
  if (!selectedEventId) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Event Selected</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Please select an event to manage sponsors and partners
          </p>
        </div>
      </div>
    );
  }

  const handleExportSponsors = () => {
    const exportData = sponsors.map(sponsor => ({
      'Organization Name': sponsor.organization_name,
      'Contact Person': sponsor.contact_person_name,
      'Email': sponsor.email,
      'Phone': sponsor.phone_number || '',
      'Sponsorship Type': sponsor.sponsorship_type,
      'Description': sponsor.description || '',
      'Website': sponsor.website_link || '',
      'Status': sponsor.status,
      'Submitted At': new Date(sponsor.created_at).toLocaleDateString(),
    }));

    exportToCSV(exportData, 'sponsors-and-partners');
  };

  const handleToggleFormStatus = (form: any) => {
    updateSponsorForm.mutate({
      id: form.id,
      is_active: !form.is_active,
    });
  };

  const handleDeleteForm = (form: any) => {
    setDeletingForm(form);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteForm = async () => {
    if (!deletingForm) return;
    await deleteSponsorForm.mutateAsync(deletingForm.id);
    setDeleteDialogOpen(false);
    setDeletingForm(null);
  };

  const handleShowQR = (form: any) => {
    setSelectedForm(form);
    setQrDialogOpen(true);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  if (isLoadingForms || isLoadingSponsors) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading sponsor data...</span>
      </div>
    );
  }

  return (
    <PaymentGuard 
      eventId={selectedEventId} 
      eventName="this event"
      feature="Partners & Sponsors"
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
          {/* Back Button & Modern Header */}
          <div className="flex flex-col gap-6">
            <Button
              onClick={() => navigate('/admin')}
              variant="ghost"
              className="self-start flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 px-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 shadow-xl shadow-purple-500/25">
                    <Users className="w-6 h-6 text-white" />
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 rounded-2xl blur opacity-30 animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sponsors & Partners</div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Manage Sponsorship Applications
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Create forms, manage applications, and track partnership opportunities
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                className="w-full lg:w-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary transform hover:scale-105"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sponsor Form
              </Button>
            </div>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="rounded-2xl border-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Submissions</CardTitle>
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.totalSubmissions}</div>
                <p className="text-xs text-muted-foreground mt-1">All time submissions</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Pending Review</CardTitle>
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/20 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/40 transition-colors">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{stats.pendingSubmissions}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Approved</CardTitle>
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.approvedSubmissions}</div>
                <p className="text-xs text-muted-foreground mt-1">Partnership approved</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 bg-white/50 dark:bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Active Forms</CardTitle>
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.activeForms}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently accepting</p>
              </CardContent>
            </Card>
          </div>

          {/* Sponsor Forms Section */}
          <Card className="rounded-2xl border-0 bg-white/60 dark:bg-card/60 backdrop-blur shadow-xl">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Sponsor Forms</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage your sponsorship application forms</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {sponsorForms.filter(f => f.is_active).length === 0 ? (
                <div className="text-center py-16">
                  {/* empty state */}
                  <div className="relative">
                    <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-6" />
                    <div className="absolute inset-0 h-16 w-16 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No sponsor forms created yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Create your first sponsor form to start collecting sponsorship applications and managing partnerships
                  </p>
                  <Button 
                    onClick={() => setCreateDialogOpen(true)}
                    className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary transform hover:scale-105"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Form
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sponsorForms
                    .filter(f => f.is_active)
                    .map((form, index) => (
                    <Card 
                      key={form.id} 
                      className="rounded-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group animate-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">{form.form_title}</CardTitle>
                            <Badge 
                              variant={form.is_active ? "default" : "secondary"} 
                              className={`mt-2 transition-all duration-200 ${form.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''}`}
                            >
                              {form.is_active ? "🟢 Active" : "⏸️ Inactive"}
                            </Badge>
                          </div>
                          <div className="flex gap-1 flex-wrap justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowQR(form)}
                              className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Show QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(form.shareable_link)}
                              className="h-9 w-9 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Copy Link"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFormStatus(form)}
                              className="h-9 w-9 p-0 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                              title={form.is_active ? "Deactivate" : "Activate"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteForm(form)}
                              className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Delete Form"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {form.form_description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{form.form_description}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                            <span className="text-sm font-medium text-muted-foreground">Form Fields:</span>
                            <span className="font-bold text-foreground">{Array.isArray(form.form_fields) ? form.form_fields.length : 0}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                            <span className="text-sm font-medium text-muted-foreground">Created:</span>
                            <span className="font-medium text-sm">{new Date(form.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sponsor Submissions Section */}
          <Card className="rounded-2xl border-0 bg-white/60 dark:bg-card/60 backdrop-blur shadow-xl">
            <CardHeader className="border-b border-border/50">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Sponsor Submissions</CardTitle>
                    <p className="text-sm text-muted-foreground">Review and manage sponsorship applications</p>
                  </div>
                </div>
                {sponsors.length > 0 && (
                  <Button 
                    onClick={handleExportSponsors}
                    variant="outline"
                    className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <SponsorsTable sponsors={sponsors} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Form Dialog */}
      <CreateSponsorFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Sponsor Form</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <SponsorFormQRCode formTitle={selectedForm.form_title} formLink={selectedForm.shareable_link} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <EditSponsorFormDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingForm(null);
        }}
        form={editingForm}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteForm} disabled={deleteSponsorForm.isPending}>
              {deleteSponsorForm.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PaymentGuard>
  );
}

export default AdminSponsorsContent;
