
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle, Info, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRules, Rule } from "@/hooks/useRules";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ruleSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
});

type RuleSchemaType = z.infer<typeof ruleSchema>;

const AdminRules = () => {
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const { rules, isLoading, createRule, updateRule, deleteRule, isCreating, isUpdating, isDeleting } = useRules();
  
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<RuleSchemaType>({
    resolver: zodResolver(ruleSchema)
  });

  const onSubmit = (data: RuleSchemaType) => {
    // Ensure required fields are present
    if (!data.title || !data.content) {
      return;
    }

    const ruleData = {
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
    };

    if (editingRule) {
      updateRule({ id: editingRule.id, ...ruleData });
      setEditingRule(null);
    } else {
      createRule(ruleData);
    }
    reset();
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setValue("title", rule.title);
    setValue("content", rule.content);
    setValue("category", rule.category || "");
    setValue("priority", rule.priority || "medium");
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    reset();
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading rules...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Event Rules</h1>
        <p className="text-muted-foreground">
          Manage rules and guidelines for event attendees ({rules.length} total).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{editingRule ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
            <CardDescription>
              {editingRule ? 'Update the rule details' : 'Create rules and guidelines for event attendees'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Rule Title</Label>
                <Input
                  id="title"
                  {...register("title")}
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
                  {...register("content")}
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

              <div className="flex gap-2">
                {editingRule && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isCreating || isUpdating}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingRule ? (isUpdating ? 'Updating...' : 'Update Rule') : (isCreating ? 'Creating...' : 'Add Rule')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Rules ({rules.length})</CardTitle>
              <CardDescription>
                List of all event rules and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No rules added yet.</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{rule.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{rule.content}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rule)}
                            disabled={isUpdating}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive p-2"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this rule? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRule(rule.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-2">
                        {rule.category && (
                          <Badge variant="outline" className="text-xs">{rule.category}</Badge>
                        )}
                        {rule.priority && (
                          <Badge className={`text-xs ${getPriorityColor(rule.priority)}`}>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(rule.priority)}
                              <span className="capitalize">{rule.priority}</span>
                            </div>
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rule.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRules;
