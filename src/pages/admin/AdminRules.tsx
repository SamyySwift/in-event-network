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
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import EventSelector from '@/components/admin/EventSelector'; // Import EventSelector
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
  const { selectedEvent, selectedEventId } = useAdminEventContext();
  const {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    isCreating,
    isUpdating,
    isDeleting,
    error: rulesError,
  } = useRules(selectedEventId);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<RuleSchemaType>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      priority: "medium"
    }
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const onSubmit = (data: RuleSchemaType) => {
    if (!selectedEventId) return;
    if (!data.title || !data.content) return;
    const ruleData = {
      title: data.title,
      content: data.content,
      category: data.category || undefined,
      priority: data.priority || 'medium' as const,
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

  if (!selectedEventId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Info className="h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Event Selected</h2>
          <p className="mb-4 text-muted-foreground text-center">
            Please select an event from the event selector at the top to manage rules. Rules are associated with each event.
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading rules for <span className="font-semibold">{selectedEvent?.name}</span>...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Event Selector */}
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Event Rules
          </h1>
          <div className="flex-1">
            <EventSelector />
          </div>
        </div>
        <p className="text-muted-foreground">
          {selectedEvent
            ? <>Manage rules and guidelines for the event: <b>{selectedEvent.name}</b>.</>
            : <>Please select an event from the selector above to start managing rules.</>}
        </p>
        {rulesError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            Error loading rules: {rulesError.message}
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{editingRule ? 'Edit Rule' : 'Add New Rule'}</CardTitle>
              <CardDescription>
                {editingRule ? 'Update the rule details for this event' : 'Create rules and guidelines for event attendees'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Disable form if no event is selected */}
              {!selectedEventId ? (
                <div className="text-center text-muted-foreground my-10">
                  <Info className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-base">Please select an event before adding or editing rules.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Rule Title *</Label>
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
                    <Label htmlFor="content">Rule Content *</Label>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
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
                      <Select value={selectedPriority} onValueChange={(value) => setValue("priority", value as "high" | "medium" | "low")}>
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
                      disabled={isCreating || isUpdating || !selectedEventId}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {editingRule
                        ? (isUpdating ? 'Updating...' : 'Update Rule')
                        : (isCreating ? 'Creating...' : 'Add Rule')}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Current Rules ({rules.length})</CardTitle>
              <CardDescription>
                {selectedEvent
                  ? <>Rules are visible to attendees of: <b>{selectedEvent.name}</b></>
                  : <>Please select an event to view its rules.</>
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEventId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No event selected.</p>
                  <p className="text-sm mt-2">Please select an event above to see rules.</p>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No rules added yet for this event.</p>
                  <p className="text-sm mt-2">Create your first rule using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm sm:text-base break-words">{rule.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1 break-words">{rule.content}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rule)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {rule.category && (
                          <Badge variant="outline" className="text-xs">
                            {rule.category}
                          </Badge>
                        )}
                        {rule.priority && (
                          <Badge className={
                            rule.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                            rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                            'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }>
                            <div className="flex items-center gap-1">
                              {rule.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                              {rule.priority === 'medium' && <Zap className="h-3 w-3" />}
                              {rule.priority === 'low' && <Info className="h-3 w-3" />}
                              <span className="capitalize text-xs">{rule.priority}</span>
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
