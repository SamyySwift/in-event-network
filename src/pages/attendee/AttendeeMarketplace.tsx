import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, MessageCircle, Instagram, ExternalLink, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const businessName = vendor.responses['Business Name'] || vendor.responses['business_name'] || '';
    const description = vendor.responses['Product/Service Description'] || vendor.responses['description'] || '';
    const searchText = `${businessName} ${description}`.toLowerCase();
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

  if (loading) {
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
            Discover and connect with event vendors
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredVendors.length} {filteredVendors.length === 1 ? 'Vendor' : 'Vendors'}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search vendors by business name or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? 'No vendors found' : 'No vendors available'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Check back later for vendor listings'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => {
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
          })}
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