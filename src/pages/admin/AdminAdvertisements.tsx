import React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import AdminLayout from "@/components/layouts/AdminLayout"
import { Plus, Trash2, ExternalLink } from "lucide-react"
import { useForm } from "react-hook-form"
import { useAdvertisements } from "@/hooks/useAdvertisements"
import { useAdminEventContext } from "@/hooks/useAdminEventContext"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const AdminAdvertisements = () => {
  const { selectedEventId } = useAdminEventContext();
  const { 
    advertisements, 
    isLoading, 
    createAdvertisement, 
    deleteAdvertisement,
    isCreating,
    isDeleting
  } = useAdvertisements(selectedEventId || undefined);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<{
    title: string;
    description: string;
    sponsor_name: string;
    priority: "high" | "medium" | "low";
    link_url?: string;
    image_url?: string;
  }>({
    defaultValues: {
      priority: "medium",
    },
  });

  const onSubmit = (data: {
    title: string;
    description: string;
    sponsor_name: string;
    priority: "high" | "medium" | "low";
    link_url?: string;
    image_url?: string;
  }) => {
    createAdvertisement({
      ...data,
      event_id: selectedEventId || undefined,
      is_active: true,
      display_order: advertisements.length,
    });
    reset();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      deleteAdvertisement(id);
    }
  };

  return (
    <AdminLayout>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">
            Manage advertisements for sponsors and partners that will be displayed to attendees.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Advertisement</CardTitle>
            <CardDescription>
              Create advertisements for sponsors and partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter advertisement title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Description is required" })}
                  placeholder="Enter advertisement description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor_name">Sponsor Name</Label>
                <Input
                  id="sponsor_name"
                  {...register("sponsor_name", { required: "Sponsor name is required" })}
                  placeholder="Enter sponsor name"
                />
                {errors.sponsor_name && (
                  <p className="text-sm text-destructive">{errors.sponsor_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  {...register("image_url")}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value) => setValue("priority", value as "high" | "medium" | "low")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_url">Target URL (Optional)</Label>
                <Input
                  id="link_url"
                  {...register("link_url")}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Adding...' : 'Add Advertisement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Advertisements</CardTitle>
              <CardDescription>
                List of all active advertisements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {advertisements.map((advertisement) => (
                    <div key={advertisement.id} className="py-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          {advertisement.image_url && (
                            <img 
                              src={advertisement.image_url} 
                              alt={advertisement.title}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <h3 className="text-lg font-semibold">{advertisement.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{advertisement.description}</p>
                          <p className="text-sm mt-2">
                            Sponsor: <span className="font-medium">{advertisement.sponsor_name}</span>
                          </p>
                          <p className="text-sm">
                            Priority: <span className="font-medium capitalize">{advertisement.priority}</span>
                          </p>
                          {advertisement.link_url && (
                            <a
                              href={advertisement.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary underline inline-flex items-center gap-1 mt-2"
                            >
                              Visit Link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(advertisement.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {advertisements.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No advertisements created yet. Create your first advertisement above.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAdvertisements;
