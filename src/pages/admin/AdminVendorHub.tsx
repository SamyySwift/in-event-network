import React, { useState, useEffect } from "react";
import {
  Plus,
  Store,
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
} from "lucide-react";
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
import {
  AdminEventProvider,
  useAdminEventContext,
} from "@/hooks/useAdminEventContext";
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

interface VendorForm {
  id: string;
  title: string;
  description: string;
  fields: VendorFormField[];
  isActive: boolean;
  createdAt: string;
  submissionsCount: number;
}

interface VendorFormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "email" | "phone" | "url";
  required: boolean;
  placeholder?: string;
}

interface VendorSubmission {
  id: string;
  formId: string;
  responses: Record<string, string>;
  submittedAt: string;
  vendorName: string;
  vendorEmail: string;
}

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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedForms = localStorage.getItem("vendorForms");
    if (savedForms) {
      setVendorForms(JSON.parse(savedForms));
    }

    const savedSubmissions = localStorage.getItem("vendorSubmissions");
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  // Save forms to localStorage whenever vendorForms changes
  useEffect(() => {
    localStorage.setItem("vendorForms", JSON.stringify(vendorForms));
  }, [vendorForms]);

  const handleCreateForm = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a form title",
        variant: "destructive",
      });
      return;
    }

    const newForm: VendorForm = {
      id: Date.now().toString(),
      title: formTitle,
      description: formDescription,
      fields: formFields,
      isActive: true,
      createdAt: new Date().toISOString(),
      submissionsCount: 0,
    };

    setVendorForms((prev) => [...prev, newForm]);
    setCreateDialogOpen(false);
    setFormTitle("");
    setFormDescription("");

    toast({
      title: "Success",
      description: "Vendor form created successfully",
    });
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

  const deleteForm = (formId: string) => {
    setVendorForms((prev) => prev.filter((form) => form.id !== formId));
    toast({
      title: "Success",
      description: "Vendor form deleted successfully",
    });
  };

  const generateFormUrl = (formId: string) => {
    return `${window.location.origin}/vendor-form/${formId}`;
  };

  const copyFormUrl = (formId: string) => {
    const url = generateFormUrl(formId);
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Form URL copied to clipboard",
    });
  };

  const viewSubmissions = (form: VendorForm) => {
    setSelectedForm(form);
    setSubmissionsDialogOpen(true);
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
      "Vendor Name",
      "Vendor Email",
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
          "Vendor Name": submission.vendorName,
          "Vendor Email": submission.vendorEmail,
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Submissions");
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
    const url = `${window.location.origin}/vendor-form/${formId}`;
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Modern Header */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendor Hub</h1>
                <p className="text-muted-foreground">
                  Create and manage vendor registration forms
                </p>
              </div>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-10">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-xl">Create Vendor Registration Form</DialogTitle>
                  <DialogDescription>
                    Design a custom form to collect vendor information for your event
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
                          placeholder="Vendor Registration Form"
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

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Form Fields</h3>
                        <p className="text-sm text-muted-foreground">Customize the fields vendors will fill out</p>
                      </div>
                      <Button onClick={addFormField} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {formFields.map((field, index) => (
                        <Card key={field.id} className="p-4 border border-border/50">
                          <div className="space-y-4">
                            {/* Field Header */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">
                                Field {index + 1}
                              </span>
                              <Button
                                onClick={() => removeFormField(field.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Field Configuration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm">Field Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) =>
                                    updateFormField(field.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Phone Number"
                                  className="h-9"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Field Type</Label>
                                <select
                                  value={field.type}
                                  onChange={(e) =>
                                    updateFormField(field.id, {
                                      type: e.target.value as VendorFormField["type"],
                                    })
                                  }
                                  className="w-full h-9 px-3 border border-input bg-background rounded-md text-sm"
                                >
                                  <option value="text">Text</option>
                                  <option value="textarea">Textarea</option>
                                  <option value="email">Email</option>
                                  <option value="phone">Phone</option>
                                  <option value="url">URL</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Placeholder</Label>
                                <Input
                                  value={field.placeholder || ""}
                                  onChange={(e) =>
                                    updateFormField(field.id, {
                                      placeholder: e.target.value,
                                    })
                                  }
                                  placeholder="+1234567890"
                                  className="h-9"
                                />
                              </div>
                            </div>

                            {/* Required Toggle */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={field.required}
                                  onCheckedChange={(checked) =>
                                    updateFormField(field.id, { required: checked })
                                  }
                                />
                                <Label className="text-sm">Required field</Label>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-foreground">{stats.totalForms}</div>
              <div className="text-sm text-muted-foreground">Total Forms</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{stats.activeForms}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
              <div className="text-sm text-muted-foreground">Submissions</div>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.recentSubmissions}</div>
              <div className="text-sm text-muted-foreground">Recent (24h)</div>
            </div>
          </div>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {vendorForms.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No vendor forms yet</h3>
                <p className="text-muted-foreground">
                  Create your first vendor registration form to get started.
                </p>
              </div>
            </div>
          ) : (
            vendorForms.map((form) => (
              <Card key={form.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    {/* Form Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {form.title}
                          </h3>
                          <Badge variant={form.isActive ? "default" : "secondary"}>
                            {form.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {form.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {form.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={form.isActive}
                          onCheckedChange={() => toggleFormStatus(form.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewSubmissions(form)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Submissions
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
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Form Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{form.fields.length} fields</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{getFormSubmissions(form.id).length} submissions</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Share className="h-4 w-4" />
                        <span className="line-clamp-1">{generateFormUrl(form.id).substring(0, 30)}...</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        onClick={() => viewSubmissions(form)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Submissions ({getFormSubmissions(form.id).length})
                      </Button>
                      <Button
                        onClick={() => exportSubmissions(form.id, "csv")}
                        variant="outline"
                        size="sm"
                        disabled={getFormSubmissions(form.id).length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button
                        onClick={() => copyFormUrl(form.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>QR Code for Vendor Form</DialogTitle>
              <DialogDescription>
                Scan this QR code or share it to allow vendors to access the form directly.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {selectedFormForQR && (
                <>
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG
                      id={`qr-code-${selectedFormForQR}`}
                      value={`${window.location.origin}/vendor-form/${selectedFormForQR}`}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-center space-y-2 w-full">
                    <p className="text-sm text-muted-foreground break-all">
                      {`${window.location.origin}/vendor-form/${selectedFormForQR}`}
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
                    placeholder="Search by vendor name or email..."
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
                      : "Share the form link to start receiving vendor registrations."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
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
      </div>
    </div>
  );
}

const AdminVendorHub = () => {
  return (
    <AdminEventProvider>
      <AdminVendorHubContent />
    </AdminEventProvider>
  );
};

export default AdminVendorHub;