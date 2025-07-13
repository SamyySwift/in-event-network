import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { 
  Building, 
  Plus, 
  Trash2, 
  Globe, 
  Phone, 
  MessageCircle, 
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  User,
  Mail,
  DollarSign,
  Package,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateMarketplaceEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
}

export function CreateMarketplaceEntryDialog({ open, onOpenChange }: CreateMarketplaceEntryDialogProps) {
  const [formData, setFormData] = useState({
    category: 'sponsor',
    organization_name: '',
    contact_person_name: '',
    email: '',
    phone_number: '',
    whatsapp_number: '',
    call_number: '',
    website_link: '',
    instagram_handle: '',
    facebook_link: '',
    twitter_link: '',
    linkedin_link: '',
    description: '',
    additional_notes: '',
    logo_url: '',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      category: 'sponsor',
      organization_name: '',
      contact_person_name: '',
      email: '',
      phone_number: '',
      whatsapp_number: '',
      call_number: '',
      website_link: '',
      instagram_handle: '',
      facebook_link: '',
      twitter_link: '',
      linkedin_link: '',
      description: '',
      additional_notes: '',
      logo_url: '',
    });
    setProducts([]);
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: `product_${Date.now()}`,
      name: '',
      description: '',
      price: '',
      currency: 'USD',
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, ...updates } : product
    ));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would call the API to create the entry
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: `${formData.category.charAt(0).toUpperCase() + formData.category.slice(1)} created successfully!`,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getCategoryIcon = () => {
    switch (formData.category) {
      case 'sponsor': return <Building className="h-5 w-5 text-blue-600" />;
      case 'partner': return <User className="h-5 w-5 text-green-600" />;
      case 'exhibitor': return <Package className="h-5 w-5 text-purple-600" />;
      default: return <Building className="h-5 w-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (formData.category) {
      case 'sponsor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner': return 'bg-green-100 text-green-800 border-green-200';
      case 'exhibitor': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl">
            {getCategoryIcon()}
            Add New {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Create a new marketplace entry with contact information, products, and links.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger className="rounded-xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="exhibitor">Exhibitor</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={getCategoryColor()}>
              {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
            </Badge>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization_name">Organization Name *</Label>
                  <Input
                    id="organization_name"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                    className="rounded-xl border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person_name">Contact Person *</Label>
                  <Input
                    id="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={(e) => setFormData({...formData, contact_person_name: e.target.value})}
                    className="rounded-xl border-2"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-xl border-2 min-h-[80px] resize-none"
                  placeholder="Describe your organization and what you offer..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  className="rounded-xl border-2"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="rounded-xl border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="rounded-xl border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp_number"
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="call_number" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Call Number
                  </Label>
                  <Input
                    id="call_number"
                    type="tel"
                    value={formData.call_number}
                    onChange={(e) => setFormData({...formData, call_number: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media & Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Links & Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website_link" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  id="website_link"
                  type="url"
                  value={formData.website_link}
                  onChange={(e) => setFormData({...formData, website_link: e.target.value})}
                  className="rounded-xl border-2"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_handle" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_link" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_link"
                    type="url"
                    value={formData.facebook_link}
                    onChange={(e) => setFormData({...formData, facebook_link: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="https://facebook.com/page"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter_link" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter_link"
                    type="url"
                    value={formData.twitter_link}
                    onChange={(e) => setFormData({...formData, twitter_link: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_link" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_link"
                    type="url"
                    value={formData.linkedin_link}
                    onChange={(e) => setFormData({...formData, linkedin_link: e.target.value})}
                    className="rounded-xl border-2"
                    placeholder="https://linkedin.com/company/name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products/Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products & Services
                </div>
                <Button 
                  type="button"
                  onClick={addProduct}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products added yet</p>
                  <p className="text-sm">Click "Add Product" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <Card key={product.id} className="border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">Product {index + 1}</CardTitle>
                          <Button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Product Name</Label>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                              className="rounded-lg border"
                              placeholder="Product or service name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Price</Label>
                              <Input
                                value={product.price}
                                onChange={(e) => updateProduct(product.id, { price: e.target.value })}
                                className="rounded-lg border"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Currency</Label>
                              <Select
                                value={product.currency}
                                onValueChange={(value) => updateProduct(product.id, { currency: value })}
                              >
                                <SelectTrigger className="rounded-lg border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="NGN">NGN</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={product.description}
                            onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                            className="rounded-lg border min-h-[60px] resize-none"
                            placeholder="Describe this product or service..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                  className="rounded-xl border-2 min-h-[80px] resize-none"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Create {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}