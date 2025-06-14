
import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import RuleStatsCards from "./components/RuleStatsCards";
import RuleCard from "./components/RuleCard";
import CreateRuleDialog from "@/components/admin/CreateRuleDialog";
import EventSelector from "@/components/admin/EventSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useAdminEventContext, AdminEventProvider } from "@/hooks/useAdminEventContext";
import { useRules, Rule } from "@/hooks/useRules";

const RulesContent = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const { rules, isLoading, createRule, updateRule, deleteRule, isCreating, isUpdating, isDeleting, error: rulesError } = useRules(selectedEventId);

  // Stats for cards
  const total = rules.length;
  const highPriority = rules.filter(r => r.priority === "high").length;
  const categories = useMemo(() =>
    Array.from(new Set(rules.map(r => r.category).filter(Boolean))).length
  , [rules]);

  // Filter rules based on search query
  const filteredRules = rules.filter(rule =>
    rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rule.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleDeleteRule = (rule: Rule) => {
    deleteRule(rule.id);
  };

  const handleDialogSubmit = (data: any) => {
    if (editingRule) {
      updateRule({ id: editingRule.id, ...data });
      setEditingRule(null);
    } else {
      createRule(data);
    }
  };

  // Reset dialog state when closed
  const handleDialogClose = (open: boolean) => {
    if (!open) setEditingRule(null);
    setDialogOpen(open);
  };

  if (!selectedEvent) {
    return (
      <div className="flex flex-col gap-5">
        <div className="border rounded-lg p-4 bg-card">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
            <p className="mt-2 text-muted-foreground">Please select an event to manage rules</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Gradient Hero Section */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
          <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-6">
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
                Event Rules
              </h1>
              <div className="flex-1">
                <EventSelector />
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
              Manage rules and guidelines for <span className="font-semibold">{selectedEvent?.name}</span>.
            </p>
            <div className="mt-6">
              <RuleStatsCards total={total} highPriority={highPriority} categories={categories} loading={isLoading} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Rules</h2>
            <p className="text-muted-foreground mt-1">
              Define and manage event rules for your attendees.
            </p>
          </div>
          <CreateRuleDialog
            open={dialogOpen}
            setOpen={handleDialogClose}
            onSubmit={handleDialogSubmit}
            isSubmitting={isCreating || isUpdating}
            editingRule={editingRule ? {
              title: editingRule.title,
              content: editingRule.content,
              category: editingRule.category,
              priority: editingRule.priority
            } : null}
          />
        </div>

        {/* Search */}
        <div className="flex justify-between mb-4">
          <Input 
            placeholder="Search rules..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                isDeleting={isDeleting}
                onEdit={handleEditRule}
                onDelete={handleDeleteRule}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-4 text-lg font-medium">No rules found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No rules match your search criteria.
              </p>
              <CreateRuleDialog
                open={dialogOpen}
                setOpen={handleDialogClose}
                onSubmit={handleDialogSubmit}
                isSubmitting={isCreating || isUpdating}
                editingRule={null}
              />
            </div>
          )}
        </div>
        {rulesError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            Error loading rules: {rulesError.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const AdminRules = () => (
  <AdminEventProvider>
    <RulesContent />
  </AdminEventProvider>
);

export default AdminRules;
