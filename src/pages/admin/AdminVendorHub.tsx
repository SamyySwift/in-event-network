import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Clock,
  CheckCircle,
  FileText,
  Download,
  QrCode,
  Share,
  Edit,
  Trash2,
  Eye,
  Search,
  Copy,
  MoreVertical,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  BarChart3,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import * as XLSX from "xlsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PaymentGuard from '@/components/payment/PaymentGuard';
import { VendorForm, VendorFormField, VendorSubmission } from '@/types/vendorForm';
import VendorFormFieldBuilder from '@/components/admin/VendorFormFieldBuilder';
import { supabase } from '@/integrations/supabase/client';

function AdminVendorHubContent() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<VendorForm | null>(null);
  const [vendorForms, setVendorForms] = useState<VendorForm[]>([]);
  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Add these missing state variables
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedFormForQR, setSelectedFormForQR] = useState<string | null>(
    null
  );

  // Edit form state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFields, setEditFields] = useState<VendorFormField[]>([]);

  // Form creation state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState<VendorFormField[]>([
    {
      id: "1",
      label: "Business Name",
      type: "text",
      required: true,
      placeholder: "Enter your business name",
    },
    {
      id: "2",
      label: "Product/Service Description",
      type: "textarea",
      required: true,
      placeholder: "Describe your products or services",
    },
    {
      id: "3",
      label: "WhatsApp Contact",
      type: "phone",
      required: true,
      placeholder: "+1234567890",
    },
    {
      id: "4",
      label: "Instagram Handle",
      type: "text",
      required: false,
      placeholder: "@yourbusiness",
    },
    {
      id: "5",
      label: "Phone Number",
      type: "phone",
      required: true,
      placeholder: "+1234567890",
    },
  ]);

  const { selectedEventId } = useAdminEventContext();

  // Load data from Supabase on component mount
  useEffect(() => {
    if (selectedEventId) {
      loadVendorForms();
      loadSubmissions();
    }
  }, [selectedEventId]);

  const loadVendorForms = async () => {
    if (!selectedEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('vendor_forms')
        .select(`
          *,
          vendor_submissions(count)
        `)
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading vendor forms:', error);
        return;
      }

      const mappedForms: VendorForm[] = (data || []).map(form => ({
        id: form.id,
        title: form.form_title,
        description: form.form_description || '',
        fields: [
          {
            id: "1",
            label: "Business Name",
            type: "text",
            required: true,
            placeholder: "Enter your business name",
          },
          {
            id: "2",
            label: "Product/Service Description",
            type: "textarea",
            required: true,
            placeholder: "Describe your products or services",
          },
          {
            id: "3",
            label: "Contact Email",
            type: "email",
            required: true,
            placeholder: "your@email.com",
          },
          {
            id: "4",
            label: "Phone Number",
            type: "phone",
            required: true,
            placeholder: "+1234567890",
          },
          {
            id: "5",
            label: "Instagram Handle",
            type: "text",
            required: false,
            placeholder: "@yourbusiness",
          },
        ],
        isActive: form.is_active,
        createdAt: form.created_at,
        submissionsCount: form.vendor_submissions?.[0]?.count || 0,
        settings: {
          allowMultipleSubmissions: false,
          requireEmailVerification: false,
          autoResponse: false,
          categories: [],
        },
      }));

      setVendorForms(mappedForms);
    } catch (error) {
      console.error('Error loading vendor forms:', error);
    }
  };

  const loadSubmissions = async () => {
    if (!selectedEventId) return;
    
    try {
      const { data, error } = await supabase
        .from('vendor_submissions')
        .select(`
          *,
          vendor_forms!inner(event_id)
        `)
        .eq('vendor_forms.event_id', selectedEventId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        return;
      }

      const mappedSubmissions: VendorSubmission[] = (data || []).map(submission => ({
        id: submission.id,
        formId: submission.form_id,
        responses: submission.responses as Record<string, string | number | boolean | string[]>,
        submittedAt: submission.submitted_at,
        vendorName: submission.vendor_name,
        vendorEmail: submission.vendor_email,
        status: submission.status as 'pending' | 'approved' | 'rejected',
        notes: submission.notes || undefined,
      }));

      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  // Helper: fetch vendor_form_fields for a form
  const fetchFormFields = async (formId: string): Promise<VendorFormField[]> => {
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('vendor_form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('field_order', { ascending: true });

    if (fieldsError) {
      console.error('Error fetching form fields:', fieldsError);
      return [];
    }

    const mapOptions = (input: any): string[] | undefined => {
      if (!input) return undefined;
      if (typeof input === 'string') {
        try { return JSON.parse(input); } catch { return undefined; }
      }
      return Array.isArray(input) ? input as string[] : undefined;
    };
    const mapValidation = (input: any): VendorFormField['validation'] | undefined => {
      if (!input) return undefined;
      if (typeof input === 'string') {
        try { return JSON.parse(input); } catch { return undefined; }
      }
      return input as VendorFormField['validation'];
    };

    return (fieldsData || []).map((f) => ({
      id: f.field_id || f.id,
      label: f.label,
      type: (f.field_type as VendorFormField['type']) || 'text',
      required: !!f.is_required,
      placeholder: f.placeholder || undefined,
      description: f.field_description || undefined,
      options: mapOptions(f.field_options),
      validation: mapValidation(f.validation_rules),
    }));
  };

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a form title",
        variant: "destructive",
      });
      return;
    }

    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "No event selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vendor_forms')
        .insert({
          event_id: selectedEventId,
          form_title: formTitle,
          form_description: formDescription || null,
          is_active: true,
          shareable_link: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating form:', error);
        toast({
          title: "Error",
          description: "Failed to create form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Insert default form fields
      const defaultFields = formFields.map((field, index) => ({
        form_id: data.id,
        field_id: field.id,
        label: field.label,
        field_type: field.type,
        is_required: field.required,
        placeholder: field.placeholder,
        field_description: field.description,
        field_options: field.options ? JSON.stringify(field.options) : null,
        validation_rules: field.validation ? JSON.stringify(field.validation) : null,
        field_order: index,
      }));

      const { error: fieldsError } = await supabase
        .from('vendor_form_fields')
        .insert(defaultFields);

      if (fieldsError) {
        console.error('Error creating form fields:', fieldsError);
        // Clean up the form if fields creation failed
        await supabase.from('vendor_forms').delete().eq('id', data.id);
        toast({
          title: "Error",
          description: "Failed to create form fields. Please try again.",
          variant: "destructive",
        });
        return;
      }

      await loadVendorForms();
      setCreateDialogOpen(false);
      setFormTitle("");
      setFormDescription("");

      toast({
        title: "Success",
        description: "Form created successfully",
      });
    } catch (error) {
      console.error('Error creating form:', error);
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addFormField = () => {
    const newField: VendorFormField = {
      id: Date.now().toString(),
      label: "",
      type: "text",
      required: false,
      placeholder: "",
    };
    setFormFields((prev) => [...prev, newField]);
  };

  const updateFormField = (id: string, updates: Partial<VendorFormField>) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const removeFormField = (id: string) => {
    setFormFields((prev) => prev.filter((field) => field.id !== id));
  };

  const toggleFormStatus = (formId: string) => {
    setVendorForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, isActive: !form.isActive } : form
      )
    );
  };

  const deleteForm = async (formId: string) => {
    try {
      // Remove submissions first (safety even if DB has cascade)
      const { error: subErr } = await supabase
        .from('vendor_submissions')
        .delete()
        .eq('form_id', formId);
      if (subErr) {
        console.error('Error deleting submissions:', subErr);
      }

      // Remove fields next
      const { error: fieldsErr } = await supabase
        .from('vendor_form_fields')
        .delete()
        .eq('form_id', formId);
      if (fieldsErr) {
        console.error('Error deleting fields:', fieldsErr);
      }

      // Finally remove the form
      const { error: formErr } = await supabase
        .from('vendor_forms')
        .delete()
        .eq('id', formId);
      if (formErr) {
        console.error('Error deleting form:', formErr);
        toast({
          title: "Error",
          description: "Failed to delete form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      await loadVendorForms();
      await loadSubmissions();

      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting form:', err);
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateFormUrl = (formId: string) => {
    return `${window.location.origin}/forms/${formId}`;
  };

  const copyFormUrl = (formId: string) => {
    const url = generateFormUrl(formId);
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Form URL copied to clipboard",
    });
  };

  const viewSubmissions = async (form: VendorForm) => {
    const dynamicFields = await fetchFormFields(form.id);
    setSelectedForm({ ...form, fields: dynamicFields.length ? dynamicFields : form.fields });
    setSubmissionsDialogOpen(true);
  };

  // Edit form flow
  const openEditForm = async (form: VendorForm) => {
    setEditingFormId(form.id);
    setEditTitle(form.title);
    setEditDescription(form.description || "");
    const dynamicFields = await fetchFormFields(form.id);
    setEditFields(dynamicFields.length ? dynamicFields : form.fields);
    setEditDialogOpen(true);
  };

  const handleUpdateForm = async () => {
    if (!editingFormId) return;
    try {
      // Update basic metadata
      const { error: updateErr } = await supabase
        .from('vendor_forms')
        .update({
          form_title: editTitle,
          form_description: editDescription || null,
        })
        .eq('id', editingFormId);
      if (updateErr) throw updateErr;

      // Replace fields for simplicity (preserve field_id values)
      const { error: delErr } = await supabase
        .from('vendor_form_fields')
        .delete()
        .eq('form_id', editingFormId);
      if (delErr) throw delErr;

      const toInsert = editFields.map((field, index) => ({
        form_id: editingFormId,
        field_id: field.id,
        label: field.label,
        field_type: field.type,
        is_required: field.required,
        placeholder: field.placeholder || null,
        field_description: field.description || null,
        field_options: field.options ? JSON.stringify(field.options) : null,
        validation_rules: field.validation ? JSON.stringify(field.validation) : null,
        field_order: index,
      }));

      const { error: insErr } = await supabase
        .from('vendor_form_fields')
        .insert(toInsert);
      if (insErr) throw insErr;

      await loadVendorForms();

      toast({
        title: "Success",
        description: "Form updated successfully",
      });
      setEditDialogOpen(false);
      setEditingFormId(null);
    } catch (err) {
      console.error('Error updating form:', err);
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportSubmissions = (
    formId: string,
    format: "csv" | "excel" = "csv"
  ) => {
    const formSubmissions = submissions.filter((s) => s.formId === formId);
    const form = vendorForms.find((f) => f.id === formId);

    if (!form || formSubmissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions found to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Submission Date",
      "Name",
      "Email",
      ...form.fields.map((f) => f.label),
    ];

    const timestamp = new Date().toISOString().split("T")[0];
    const sanitizedFormTitle = form.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `${sanitizedFormTitle}_submissions_${timestamp}`;

    if (format === "csv") {
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...formSubmissions.map((submission) =>
          [
            new Date(submission.submittedAt).toLocaleDateString(),
            submission.vendorName,
            submission.vendorEmail,
            ...form.fields.map((field) => submission.responses[field.id] || ""),
          ]
            .map((cell) => `"${cell}"`)
            .join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Excel export
      const worksheetData = formSubmissions.map((submission) => {
        const rowData: Record<string, any> = {
          "Submission Date": new Date(
            submission.submittedAt
          ).toLocaleDateString(),
          "Name": submission.vendorName,
          "Email": submission.vendorEmail,
        };

        // Add all form fields
        form.fields.forEach((field) => {
          rowData[field.label] = submission.responses[field.id] || "N/A";
        });

        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Submission Date
        { wch: 20 }, // Vendor Name
        { wch: 30 }, // Vendor Email
        ...form.fields.map(() => ({ wch: 20 })), // Form fields
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Form Submissions");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    }

    toast({
      title: "Success",
      description: `Submissions exported successfully as ${format.toUpperCase()}`,
    });
  };

  const getFormSubmissions = (formId: string) => {
    return submissions.filter((s) => s.formId === formId);
  };

  // Add these functions inside the component
  const generateQRCode = (formId: string) => {
    setSelectedFormForQR(formId);
    setShowQRDialog(true);
  };

  const downloadQRCode = (formId: string, formTitle: string) => {
    const svg = document.getElementById(`qr-code-${formId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 256;
      canvas.height = 256;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          const link = document.createElement("a");
          link.download = `${formTitle.replace(/\s+/g, "_")}_QR_Code.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const copyFormURL = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "Success",
          description: "Form URL copied to clipboard!",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy URL to clipboard.",
          variant: "destructive",
        });
      });
  };

  const filteredSubmissions = selectedForm
    ? getFormSubmissions(selectedForm.id).filter(
        (submission) =>
          submission.vendorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          submission.vendorEmail
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  const stats = {
    totalForms: vendorForms.length,
    activeForms: vendorForms.filter((f) => f.isActive).length,
    totalSubmissions: submissions.length,
    recentSubmissions: submissions.filter((s) => {
      const submissionDate = new Date(s.submittedAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return submissionDate > oneDayAgo;
    }).length,
  };

  return (
    <PaymentGuard 
      eventId={selectedEventId || ''}
      eventName="this event"
      feature="Forms"
    >
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-border/50 backdrop-blur-sm mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                    <FileText className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="space-y-3 min-w-0">
                  <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Forms
                  </h1>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Create and manage forms with powerful customization options
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Forms Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Real-time Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap lg:flex-nowrap">
                <Button variant="outline" className="h-11 px-6 border-border/50 hover:bg-accent/50 backdrop-blur-sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Forms
                </Button>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-11 px-6 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Form
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-6">
                      <DialogTitle className="text-xl">Create Form</DialogTitle>
                      <DialogDescription>
                        Design a custom form to collect information for your event
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-8">
                      {/* Form Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="formTitle" className="text-sm font-medium">Form Title</Label>
                            <Input
                              id="formTitle"
                              value={formTitle}
                              onChange={(e) => setFormTitle(e.target.value)}
                              placeholder="Form Title"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="formDescription" className="text-sm font-medium">Description</Label>
                            <Textarea
                              id="formDescription"
                              value={formDescription}
                              onChange={(e) => setFormDescription(e.target.value)}
                              placeholder="Brief description of the form purpose..."
                              rows={2}
                              className="resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Form Fields Builder */}
                      <VendorFormFieldBuilder
                        fields={formFields}
                        onFieldsChange={setFormFields}
                      />

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                        <Button
                          onClick={handleCreateForm}
                          disabled={!formTitle.trim()}
                          className="flex-1 h-11"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Form
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                          className="flex-1 h-11"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

          {/* Dynamic Stats Dashboard */}
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.3 }}
                  >
                    {stats.totalForms}
                  </motion.div>
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.round(Math.random() * 12)}% this week</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500 hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="text-3xl font-bold text-green-600"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.4 }}
                  >
                    {stats.activeForms}
                  </motion.div>
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Active Forms</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live & collecting</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500 hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="text-3xl font-bold text-purple-600"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.5 }}
                  >
                    {stats.totalSubmissions}
                  </motion.div>
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Users className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.round(Math.random() * 25)}% growth</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 hover:-translate-y-1"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                  <motion.div 
                    className="text-3xl font-bold text-orange-600"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.6, delay: 0.6 }}
                  >
                    {stats.recentSubmissions}
                  </motion.div>
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <Zap className="h-4 w-4 text-orange-500" />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Recent (24h)</p>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span>Last 24 hours</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Modern Forms List */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <AnimatePresence>
              {vendorForms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium">No forms yet</p>
                  <p className="mt-2 text-muted-foreground">
                    Create your first form to start collecting submissions.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {vendorForms.map((form, index) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="group"
                    >
                      <Card className="relative overflow-hidden border border-border/50 hover:border-primary/20 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
                        {/* Animated background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        {/* Status indicator line */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                          form.isActive 
                            ? 'from-green-500 to-emerald-400' 
                            : 'from-gray-400 to-gray-300'
                        }`} />

                        <CardContent className="relative p-8 space-y-6">
                          {/* Form Header */}
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1">
                              <motion.div 
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg ${
                                  form.isActive 
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                }`}
                                whileHover={{ rotate: 5 }}
                              >
                                <FileText className="h-6 w-6 text-white" />
                              </motion.div>
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent line-clamp-1">
                                    {form.title}
                                  </h3>
                                  <Badge 
                                    variant={form.isActive ? "default" : "secondary"}
                                    className={`px-3 py-1 rounded-full font-medium ${
                                      form.isActive 
                                        ? 'bg-green-500/10 text-green-700 border-green-500/20' 
                                        : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                                    }`}
                                  >
                                    {form.isActive ? '● Active' : '○ Inactive'}
                                  </Badge>
                                </div>
                                {form.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {form.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <motion.div whileTap={{ scale: 0.95 }}>
                                <Switch
                                  checked={form.isActive}
                                  onCheckedChange={() => toggleFormStatus(form.id)}
                                  className="data-[state=checked]:bg-green-500"
                                />
                              </motion.div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-accent/50">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => viewSubmissions(form)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Submissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditForm(form)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Form
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => generateQRCode(form.id)}>
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Generate QR Code
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => copyFormUrl(form.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy URL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteForm(form.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Form
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Enhanced Form Stats */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                              <div className="p-2 bg-blue-500/10 rounded-lg">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-700">{form.fields.length}</div>
                                <div className="text-xs text-blue-600/80">Fields</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Users className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-purple-700">{getFormSubmissions(form.id).length}</div>
                                <div className="text-xs text-purple-600/80">Submissions</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                              <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Clock className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-emerald-700">{new Date(form.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-emerald-600/80">Created</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                              <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Share className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-orange-700 truncate">
                                  {generateFormUrl(form.id).split('/').pop()}
                                </div>
                                <div className="text-xs text-orange-600/80">Share URL</div>
                              </div>
                            </div>
                          </div>

                          {/* Modern Action Buttons */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => viewSubmissions(form)}
                                variant="outline"
                                className="h-10 px-4 rounded-xl border-border/50 hover:bg-blue-500/5 hover:border-blue-500/20 hover:text-blue-700 transition-all duration-200"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View ({getFormSubmissions(form.id).length})
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => exportSubmissions(form.id, "csv")}
                                variant="outline"
                                disabled={getFormSubmissions(form.id).length === 0}
                                className="h-10 px-4 rounded-xl border-border/50 hover:bg-green-500/5 hover:border-green-500/20 hover:text-green-700 transition-all duration-200 disabled:opacity-50"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                onClick={() => copyFormUrl(form.id)}
                                variant="outline"
                                className="h-10 px-4 rounded-xl border-border/50 hover:bg-purple-500/5 hover:border-purple-500/20 hover:text-purple-700 transition-all duration-200"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>QR Code for Form</DialogTitle>
              <DialogDescription>
                Scan this QR code or share it to allow users to access the form directly.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {selectedFormForQR && (
                <>
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG
                      id={`qr-code-${selectedFormForQR}`}
                      value={`${window.location.origin}/forms/${selectedFormForQR}`}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-center space-y-2 w-full">
                    <p className="text-sm text-muted-foreground break-all">
                      {`${window.location.origin}/forms/${selectedFormForQR}`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyFormURL(selectedFormForQR)}
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <Copy className="h-3 w-3" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const form = vendorForms.find(
                            (f) => f.id === selectedFormForQR
                          );
                          if (form) {
                            downloadQRCode(selectedFormForQR, form.title);
                          }
                        }}
                        className="flex items-center justify-center gap-1 w-full"
                      >
                        <Download className="h-3 w-3" />
                        Download QR
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Submissions Dialog */}
        <Dialog open={submissionsDialogOpen} onOpenChange={setSubmissionsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submissions for {selectedForm?.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={() =>
                    selectedForm && exportSubmissions(selectedForm.id)
                  }
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>

              {/* Submissions Table */}
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No submissions yet
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No submissions match your search."
                      : (selectedForm
                          ? "Share the form link to start receiving submissions."
                          : "Select a form to view submissions.")}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        {selectedForm?.fields.slice(0, 3).map((field) => (
                          <TableHead key={field.id}>{field.label}</TableHead>
                        ))}
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {submission.vendorName}
                          </TableCell>
                          <TableCell>{submission.vendorEmail}</TableCell>
                          {selectedForm?.fields.slice(0, 3).map((field) => (
                            <TableCell key={field.id} className="max-w-[150px] truncate">
                              {submission.responses[field.id] || "-"}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const details = selectedForm?.fields
                                  .map(
                                    (field) =>
                                      `${field.label}: ${
                                        submission.responses[field.id] || "N/A"
                                      }`
                                  )
                                  .join("\n");
                                alert(`Full Submission Details:\n\n${details}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Form Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-xl">Edit Form</DialogTitle>
              <DialogDescription>Update form details and fields</DialogDescription>
            </DialogHeader>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFormTitle" className="text-sm font-medium">Form Title</Label>
                  <Input
                    id="editFormTitle"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Form Title"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editFormDescription" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="editFormDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>

              <VendorFormFieldBuilder
                fields={editFields}
                onFieldsChange={setEditFields}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  onClick={handleUpdateForm}
                  disabled={!editTitle.trim() || !editingFormId}
                  className="flex-1 h-11"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </PaymentGuard>
  );
}

const AdminVendorHub = AdminVendorHubContent;

export default AdminVendorHub;