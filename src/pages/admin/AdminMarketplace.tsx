import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Building,
  MessageCircle,
  Instagram,
  QrCode,
  Package,
  DollarSign
} from 'lucide-react';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { AdminEventProvider, useAdminEventContext } from '@/hooks/useAdminEventContext';
import { CreateMarketplaceEntryDialog } from '@/components/admin/CreateMarketplaceEntryDialog';
import { MarketplaceQRCode } from '@/components/admin/MarketplaceQRCode';

const AdminMarketplaceContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createEntryDialogOpen, setCreateEntryDialogOpen] = useState(false);
  const [selectedEntryForQR, setSelectedEntryForQR] = useState<any>(null);

  const { selectedEvent } = useAdminEventContext();
  const { 
    sponsors, 
    sponsorForms, 
    isLoadingSponsors, 
    updateSponsorStatus, 
    stats 
  } = useAdminSponsors();

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = 
      sponsor.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.contact_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sponsor.sponsorship_type && sponsor.sponsorship_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sponsor.category && sponsor.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || sponsor.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || sponsor.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate marketplace stats
  const marketplaceStats = {
    totalSubmissions: sponsors.length,
    sponsorsCount: sponsors.filter(s => s.category === 'sponsor' || !s.category).length,
    partnersCount: sponsors.filter(s => s.category === 'partner').length,
    exhibitorsCount: sponsors.filter(s => s.category === 'exhibitor').length,
    pendingSubmissions: sponsors.filter(s => s.status === 'pending').length,
    approvedSubmissions: sponsors.filter(s => s.status === 'approved').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'sponsor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sponsor</Badge>;
      case 'partner':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Partner</Badge>;
      case 'exhibitor':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Exhibitor</Badge>;
      default:
        return <Badge variant="secondary">Sponsor</Badge>;
    }
  };

  const handleStatusUpdate = async (sponsorId: string, newStatus: string) => {
    try {
      await updateSponsorStatus.mutateAsync({ id: sponsorId, status: newStatus });
    } catch (error) {
      console.error('Error updating sponsor status:', error);
    }
  };

  if (isLoadingSponsors) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  // Debug info - remove this after testing
  console.log('Selected Event:', selectedEvent);
  console.log('Sponsors data:', sponsors);
  console.log('Is loading:', isLoadingSponsors);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace Management</h1>
          <p className="text-muted-foreground">
            Manage sponsors, partners, and exhibitors for your event marketplace
          </p>
        </div>
        <Button 
          onClick={() => setCreateEntryDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{marketplaceStats.sponsorsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partners</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{marketplaceStats.partnersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exhibitors</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{marketplaceStats.exhibitorsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.pendingSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Entries</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketplaceStats.approvedSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by organization, contact person, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            <option value="sponsor">Sponsors</option>
            <option value="partner">Partners</option>
            <option value="exhibitor">Exhibitors</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No entries found' : 'No marketplace entries yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Add sponsors, partners, or exhibitors to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
            <Button onClick={() => setCreateEntryDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Entry
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSponsors.map((sponsor) => (
            <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {sponsor.organization_name}
                      {getCategoryBadge(sponsor.category || 'sponsor')}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {sponsor.contact_person_name}
                    </CardDescription>
                  </div>
                  {getStatusBadge(sponsor.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {sponsor.sponsorship_type && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sponsor.sponsorship_type}
                      </Badge>
                    </div>
                  )}
                  
                  {sponsor.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {sponsor.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col gap-1 pt-2">
                    {sponsor.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {sponsor.email}
                      </div>
                    )}
                    {sponsor.phone_number && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {sponsor.phone_number}
                      </div>
                    )}
                    {sponsor.whatsapp_number && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3 text-green-600" />
                        {sponsor.whatsapp_number}
                      </div>
                    )}
                    {sponsor.website_link && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <a 
                          href={sponsor.website_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEntryForQR(sponsor)}
                    className="flex items-center gap-1"
                  >
                    <QrCode className="h-3 w-3" />
                    QR Code
                  </Button>
                  
                  {sponsor.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(sponsor.id, 'approved')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(sponsor.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Applied {new Date(sponsor.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Display */}
      {selectedEntryForQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEntryForQR(null)}>
          <div className="bg-white p-6 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <MarketplaceQRCode data={selectedEntryForQR} />
          </div>
        </div>
      )}

      <CreateMarketplaceEntryDialog
        open={createEntryDialogOpen}
        onOpenChange={setCreateEntryDialogOpen}
      />
    </div>
  );
};

const AdminMarketplace = () => {
  return (
    <AdminEventProvider>
      <AdminMarketplaceContent />
    </AdminEventProvider>
  );
};

export default AdminMarketplace;