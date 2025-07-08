
import React, { useState } from 'react';
import { Plus, Users, Clock, CheckCircle, FileText, Download, QrCode, Share, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { CreateSponsorFormDialog } from '@/components/admin/CreateSponsorFormDialog';
import { SponsorFormQRCode } from '@/components/admin/SponsorFormQRCode';
import { SponsorsTable } from '@/components/admin/SponsorsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV } from '@/utils/exportUtils';
import { AdminEventProvider, useAdminEventContext } from '@/hooks/useAdminEventContext';

function AdminSponsorsContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  
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

  const handleDeleteForm = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      deleteSponsorForm.mutate(formId);
    }
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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Modern Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </span>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sponsors & Partners</div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Manage sponsorship applications
            </h1>
          </div>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)} 
          className="w-full sm:w-auto rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Sponsor Form
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingSubmissions}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedSubmissions}</div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Forms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeForms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor Forms */}
      <Card className="rounded-xl border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sponsor Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {sponsorForms.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sponsor forms created</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first sponsor form to start collecting sponsorship applications
              </p>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sponsor Form
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {sponsorForms.map((form) => (
                <Card key={form.id} className="rounded-xl border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">{form.form_title}</CardTitle>
                        <Badge variant={form.is_active ? "default" : "secondary"} className="mt-2">
                          {form.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowQR(form)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                          title="Show QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(form.shareable_link)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-lg"
                          title="Copy Link"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFormStatus(form)}
                          className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 rounded-lg"
                          title={form.is_active ? "Deactivate" : "Activate"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteForm(form.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg"
                          title="Delete Form"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {form.form_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{form.form_description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Fields:</span>
                        <span className="font-medium">{Array.isArray(form.form_fields) ? form.form_fields.length : 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="font-medium text-xs">{new Date(form.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsor Submissions */}
      <Card className="rounded-xl border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Sponsor Submissions</CardTitle>
          {sponsors.length > 0 && (
            <Button 
              onClick={handleExportSponsors}
              variant="outline"
              className="rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <SponsorsTable sponsors={sponsors} />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSponsorFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for {selectedForm?.form_title}</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <SponsorFormQRCode 
              formLink={selectedForm.shareable_link}
              formTitle={selectedForm.form_title}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminSponsors() {
  return (
    <AdminEventProvider>
      <AdminSponsorsContent />
    </AdminEventProvider>
  );
}
