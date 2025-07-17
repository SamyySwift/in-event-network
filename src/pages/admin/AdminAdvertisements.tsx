import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from "@/components/ui/textarea"
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"

type Advertisement = {
  id: string;
  title: string;
  content: string;
  sponsor: string;
  priority: 'high' | 'medium' | 'low';
  targetUrl?: string;
};

const AdminAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<{
    title: string;
    content: string;
    sponsor: string;
    priority: 'high' | 'medium' | 'low';
    targetUrl?: string;
  }>();

  const onSubmit = (data: {
    title: string;
    content: string;
    sponsor: string;
    priority: 'high' | 'medium' | 'low';
    targetUrl?: string;
  }) => {
    const newAdvertisement: Advertisement = {
      id: Math.random().toString(36).substring(7),
      ...data,
    };
    setAdvertisements([...advertisements, newAdvertisement]);
  };

  return (
    <AdminLayout>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">
            Manage advertisements for sponsors and partners.
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
                {errors.title?.message && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "Content is required" })}
                  placeholder="Enter advertisement content"
                  rows={3}
                />
                {errors.content?.message && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor</Label>
                <Input
                  id="sponsor"
                  {...register("sponsor", { required: "Sponsor is required" })}
                  placeholder="Enter sponsor name"
                />
                {errors.sponsor?.message && (
                  <p className="text-sm text-destructive">{errors.sponsor.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select onValueChange={(value) => setValue("priority", value as "high" | "medium" | "low")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority?.message && (
                    <p className="text-sm text-destructive">{errors.priority.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetUrl">Target URL (Optional)</Label>
                  <Input
                    id="targetUrl"
                    {...register("targetUrl")}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Advertisement
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
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {advertisements.map((advertisement) => (
                  <div key={advertisement.id} className="py-4">
                    <h3 className="text-lg font-semibold">{advertisement.title}</h3>
                    <p className="text-sm text-muted-foreground">{advertisement.content}</p>
                    <p className="text-sm">
                      Sponsor: <span className="font-medium">{advertisement.sponsor}</span>
                    </p>
                    <p className="text-sm">
                      Priority: <span className="font-medium">{advertisement.priority}</span>
                    </p>
                    {advertisement.targetUrl && (
                      <a
                        href={advertisement.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Visit Sponsor
                      </a>
                    )}
                  </div>
                ))}
                {advertisements.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No advertisements created yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAdvertisements;
