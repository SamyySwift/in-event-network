import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, MessageCircle, Instagram, ExternalLink, Store, Building, Globe, Mail, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAttendeeSponsors } from '@/hooks/useAttendeeSponsors';

interface VendorSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  responses: Record<string, any>;
}

interface VendorForm {
  id: string;
  title: string;
  description: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  isActive: boolean;
  submissionsCount: number;
}

const AttendeeMarketplaceContent = () => {
  const [vendors, setVendors] = useState<VendorSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'sponsors' | 'vendors'>('sponsors');
  const { toast } = useToast();
  
  // Get sponsors from database
  const { sponsors, isLoading: isLoadingSponsors } = useAttendeeSponsors();
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  useEffect(() => {
    loadVendorSubmissions();
  }, []);

  const loadVendorSubmissions = () => {
    try {
      // Load all vendor forms
      const savedForms = localStorage.getItem('vendorForms');
      const forms: VendorForm[] = savedForms ? JSON.parse(savedForms) : [];
      
      // Load all submissions from active forms
      const allSubmissions: VendorSubmission[] = [];
      
      forms.forEach(form => {
        if (form.isActive) {
          const submissionsKey = `submissions_${form.id}`;
          const savedSubmissions = localStorage.getItem(submissionsKey);
          if (savedSubmissions) {
            const submissions: VendorSubmission[] = JSON.parse(savedSubmissions);
            allSubmissions.push(...submissions);
          }
        }
      });
      
      setVendors(allSubmissions);
    } catch (error) {
      console.error('Error loading vendor submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor information.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const businessName = vendor.responses['Business Name'] || vendor.responses['business_name'] || '';
    const description = vendor.responses['Product/Service Description'] || vendor.responses['description'] || '';
    const searchText = `${businessName} ${description}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const filteredSponsors = sponsors.filter(sponsor => {
    const searchText = `${sponsor.organization_name} ${sponsor.description || ''} ${sponsor.sponsorship_type}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    } else {
      toast({
        title: "No Phone Number",
        description: "This vendor hasn't provided a phone number.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (phoneNumber) {
      // Remove any non-numeric characters and format for WhatsApp
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else {
      toast({
        title: "No WhatsApp Contact",
        description: "This vendor hasn't provided a WhatsApp number.",
        variant: "destructive",
      });
    }
  };

  const handleInstagram = (instagramHandle: string) => {
    if (instagramHandle) {
      // Remove @ if present and create Instagram URL
      const handle = instagramHandle.replace('@', '');
      window.open(`https://instagram.com/${handle}`, '_blank');
    } else {
      toast({
        title: "No Instagram",
        description: "This vendor hasn't provided an Instagram handle.",
        variant: "destructive",
      });
    }
  };

  const getVendorInfo = (vendor: VendorSubmission) => {
    return {
      businessName: vendor.responses['Business Name'] || vendor.responses['business_name'] || 'Unknown Business',
      description: vendor.responses['Product/Service Description'] || vendor.responses['description'] || 'No description provided',
      phone: vendor.responses['Phone Number'] || vendor.responses['phone'] || vendor.responses['WhatsApp Contact'] || vendor.responses['whatsapp'] || '',
      instagram: vendor.responses['Instagram Handle'] || vendor.responses['instagram'] || '',
      whatsapp: vendor.responses['WhatsApp Contact'] || vendor.responses['whatsapp'] || vendor.responses['Phone Number'] || vendor.responses['phone'] || ''
    };
  };

  const isLoading = activeTab === 'sponsors' ? isLoadingSponsors : isLoadingVendors;
  const currentItems = activeTab === 'sponsors' ? filteredSponsors : filteredVendors;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover sponsors, partners and vendors for this event
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {currentItems.length} {activeTab === 'sponsors' ? 
            (currentItems.length === 1 ? 'Sponsor' : 'Sponsors') : 
            (currentItems.length === 1 ? 'Vendor' : 'Vendors')
          }
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'sponsors' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sponsors')}
          className="rounded-b-none"
        >
          <Building className="h-4 w-4 mr-2" />
          Sponsors & Partners ({filteredSponsors.length})
        </Button>
        <Button
          variant={activeTab === 'vendors' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('vendors')}
          className="rounded-b-none"
        >
          <Store className="h-4 w-4 mr-2" />
          Vendors ({filteredVendors.length})
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={activeTab === 'sponsors' ? 
            "Search sponsors by organization or service..." : 
            "Search vendors by business name or service..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Grid */}
      {currentItems.length === 0 ? (
        <div className="text-center py-12">
          {activeTab === 'sponsors' ? (
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          ) : (
            <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          )}
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 
              `No ${activeTab} found` : 
              `No ${activeTab} available`
            }
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : `Check back later for ${activeTab} listings`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeTab === 'sponsors' ? (
            filteredSponsors.map((sponsor) => (
              <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    {sponsor.organization_name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {sponsor.description || 'Partner organization for this event'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {sponsor.sponsorship_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      <Heart className="h-3 w-3 mr-1" />
                      Partner
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {sponsor.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${sponsor.email}`)}
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                    )}
                    {sponsor.phone_number && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCall(sponsor.phone_number)}
                        className="flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    )}
                    {sponsor.website_link && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(sponsor.website_link, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </Button>
                    )}
                  </div>
                  
                  {sponsor.contact_person_name && (
                    <div className="text-sm text-muted-foreground">
                      Contact: {sponsor.contact_person_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            filteredVendors.map((vendor) => {
              const vendorInfo = getVendorInfo(vendor);
              return (
                <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      {vendorInfo.businessName}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {vendorInfo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vendorInfo.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall(vendorInfo.phone)}
                          className="flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          Call
                        </Button>
                      )}
                      {vendorInfo.whatsapp && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsApp(vendorInfo.whatsapp)}
                          className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </Button>
                      )}
                      {vendorInfo.instagram && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInstagram(vendorInfo.instagram)}
                          className="flex items-center gap-1 text-pink-600 border-pink-600 hover:bg-pink-50"
                        >
                          <Instagram className="h-3 w-3" />
                          Instagram
                        </Button>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Listed {new Date(vendor.submittedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const AttendeeMarketplace = () => {
  return (
    <div className="container mx-auto p-6">
      <AttendeeMarketplaceContent />
    </div>
  );
};

export default AttendeeMarketplace;