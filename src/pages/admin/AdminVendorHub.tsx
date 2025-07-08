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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Hub</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage vendor registration forms for your events
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Create Vendor Form
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Vendor Registration Form</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Form Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                    id="formTitle"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Vendor Registration Form"
                  />
                </div>

                <div>
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the purpose of this vendor form..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Form Fields</h3>
                  <Button onClick={addFormField} variant="outline" size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-3">
                  {formFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateFormField(field.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Field label"
                          />
                        </div>

                        <div>
                          <Label>Field Type</Label>
                          <select
                            className="w-full p-2 border rounded-md"
                            value={field.type}
                            onChange={(e) =>
                              updateFormField(field.id, {
                                type: e.target.value as any,
                              })
                            }
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="url">URL</option>
                          </select>
                        </div>

                        <div>
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateFormField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Placeholder text"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                updateFormField(field.id, { required: checked })
                              }
                            />
                            <Label>Required</Label>
                          </div>

                          {formFields.length > 1 && (
                            <Button
                              onClick={() => removeFormField(field.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateForm}>Create Form</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Submissions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentSubmissions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Forms List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {vendorForms.length === 0 ? (
            <div className="text-center py-8">
              <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No vendor forms yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first vendor registration form to get started
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Vendor Form
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorForms.map((form) => (
                <Card key={form.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{form.title}</h3>
                        <Badge
                          variant={form.isActive ? "default" : "secondary"}
                        >
                          {form.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {form.description && (
                        <p className="text-muted-foreground mb-2">
                          {form.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{form.fields.length} fields</span>
                        <span>
                          {getFormSubmissions(form.id).length} submissions
                        </span>
                        <span>
                          Created{" "}
                          {new Date(form.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => viewSubmissions(form)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye size={16} className="mr-2" />
                        View Submissions
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download size={16} className="mr-2" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => exportSubmissions(form.id, 'csv')}>
                            Export as CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportSubmissions(form.id, 'excel')}>
                            Export as Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        onClick={() => copyFormUrl(form.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Share size={16} className="mr-2" />
                        Share
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedForm(form);
                          setQrDialogOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <QrCode size={16} className="mr-2" />
                        QR Code
                      </Button>

                      <Button
                        onClick={() => toggleFormStatus(form.id)}
                        variant="outline"
                        size="sm"
                      >
                        {form.isActive ? "Deactivate" : "Activate"}
                      </Button>

                      <Button
                        onClick={() => deleteForm(form.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Dialog */}
      <Dialog
        open={submissionsDialogOpen}
        onOpenChange={setSubmissionsDialogOpen}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submissions for {selectedForm?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search size={16} className="text-muted-foreground" />
              <Input
                placeholder="Search by vendor name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button
                onClick={() =>
                  selectedForm && exportSubmissions(selectedForm.id)
                }
                variant="outline"
                size="sm"
              >
                <Download size={16} className="mr-2" />
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
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Vendor Name</TableHead>
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
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {submission.vendorName}
                        </TableCell>
                        <TableCell>{submission.vendorEmail}</TableCell>
                        {selectedForm?.fields.slice(0, 3).map((field) => (
                          <TableCell
                            key={field.id}
                            className="max-w-[200px] truncate"
                          >
                            {submission.responses[field.id] || "-"}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Show full submission details
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
                            <Eye size={16} className="mr-2" />
                            View Details
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

      {/* QR Code Dialog - MOVED INSIDE the main div */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for Vendor Form</DialogTitle>
            <DialogDescription>
              Scan this QR code or share it to allow vendors to access the form
              directly.
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
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {`${window.location.origin}/vendor-form/${selectedFormForQR}`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyFormURL(selectedFormForQR)}
                      className="flex items-center gap-1"
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
                      className="flex items-center gap-1"
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

// Add these imports at the top of the file
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
