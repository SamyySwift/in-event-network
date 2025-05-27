import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for form validation
const ruleSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

type RuleSchemaType = z.infer<typeof ruleSchema>;

const AdminRules = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RuleSchemaType>({
    resolver: zodResolver(ruleSchema)
  });

  const onSubmit = (data: RuleSchemaType) => {
    console.log("Form submitted with data:", data);
    // Handle form submission logic here
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Rules</h1>
        <p className="text-muted-foreground">
          Manage rules and guidelines for event attendees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Rule</CardTitle>
            <CardDescription>
              Create rules and guidelines for event attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Rule Title</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Rule title is required" })}
                  placeholder="Enter rule title"
                />
                {errors.title?.message && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Rule Content</Label>
                <Textarea
                  id="content"
                  {...register("content", { required: "Rule content is required" })}
                  placeholder="Enter detailed rule description"
                  rows={4}
                />
                {errors.content?.message && (
                  <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="conduct">Conduct</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
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
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Rules</CardTitle>
              <CardDescription>
                List of all event rules and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for rules list */}
              <p>No rules added yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRules;
