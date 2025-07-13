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
  Building
} from 'lucide-react';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { CreateSponsorFormDialog } from '@/components/admin/CreateSponsorFormDialog';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

const AdminMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createFormDialogOpen, setCreateFormDialogOpen] = useState(false);

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
      sponsor.sponsorship_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sponsor.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace Management</h1>
          <p className="text-muted-foreground">
            Manage sponsors and partners for your event marketplace
          </p>
        </div>
        <Button 
          onClick={() => setCreateFormDialogOpen(true)}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Sponsor Form
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Partners</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search sponsors by organization or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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

      {/* Sponsors List */}
      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No sponsors found' : 'No sponsor applications yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create a sponsor form to start receiving applications'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setCreateFormDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sponsor Form
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
                    <CardTitle className="text-lg font-semibold">
                      {sponsor.organization_name}
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sponsor.sponsorship_type}
                    </Badge>
                  </div>
                  
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

                {sponsor.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(sponsor.id, 'approved')}
                      className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(sponsor.id, 'rejected')}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Applied {new Date(sponsor.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSponsorFormDialog
        open={createFormDialogOpen}
        onOpenChange={setCreateFormDialogOpen}
      />
    </div>
  );
};

export default AdminMarketplace;