import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit, Trash2, BookText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock data for rules
const mockRules = [
  {
    id: '1',
    title: 'Code of Conduct',
    content: 'We expect all attendees to follow our code of conduct. This includes treating all participants with respect, refraining from harassment or discrimination, and following the guidelines set by the event organizers.',
    category: 'General',
    order: 1,
  },
  {
    id: '2',
    title: 'Photography & Recording Policy',
    content: 'Photography and recording are allowed in public spaces. However, please refrain from recording or taking photos during sessions without explicit permission from the speakers. Some sessions may have specific no-recording policies.',
    category: 'Sessions',
    order: 1,
  },
  {
    id: '3',
    title: 'Session Attendance',
    content: 'Please arrive 5 minutes before sessions begin. Late entries may be restricted for certain high-demand sessions. If a session is full, please respect the room capacity limits and find an alternative session.',
    category: 'Sessions',
    order: 2,
  },
  {
    id: '4',
    title: 'Food & Beverage Rules',
    content: 'Food and drinks are not allowed in the main auditorium and certain session rooms. Designated eating areas are available throughout the venue. Please dispose of all waste in appropriate bins.',
    category: 'Venue',
    order: 1,
  },
  {
    id: '5',
    title: 'Wi-Fi Usage Guidelines',
    content: 'Free Wi-Fi is provided for all attendees. Please refrain from high-bandwidth activities like video streaming which may impact service for others. The network details will be provided at registration.',
    category: 'Technical',
    order: 1,
  }
];

// Create new rule form component
const RuleForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      category: 'General',
      order: 1
    }
  });

  const onFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Rule Title</Label>
        <Input 
          id="title" 
          placeholder="Enter rule title" 
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select defaultValue="General" {...register("category")}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Sessions">Sessions</SelectItem>
            <SelectItem value="Venue">Venue</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content" 
          placeholder="Enter rule content" 
          rows={4}
          {...register("content", { required: "Content is required" })}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input 
          id="order" 
          type="number" 
          min="1"
          {...register("order", { valueAsNumber: true })}
        />
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Rule</Button>
      </div>
    </form>
  );
};

const AdminRules = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['General']);
  const isMobile = useIsMobile();
  const [rules, setRules] = useState(mockRules);
  
  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);
  
  // Sort each category's rules by order
  Object.keys(rulesByCategory).forEach(category => {
    rulesByCategory[category].sort((a, b) => a.order - b.order);
  });

  const handleCreateRule = (ruleData) => {
    const newRule = {
      id: `${rules.length + 1}`,
      title: ruleData.title,
      content: ruleData.content,
      category: ruleData.category,
      order: ruleData.order,
    };
    
    setRules([...rules, newRule]);
    toast.success("Rule created successfully!");
  };

  const handleEditRule = (rule) => {
    console.log('Edit rule', rule);
    toast.info("Edit rule dialog would open here");
  };

  const handleDeleteRule = (rule) => {
    setRules(rules.filter(r => r.id !== rule.id));
    toast.success("Rule deleted successfully!");
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Event Rules"
        description="Create and manage rules and guidelines for attendees"
        actionLabel="Create Rule"
        actionForm={<RuleForm onSubmit={handleCreateRule} />}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookText size={20} className="text-primary" />
                <CardTitle>Rules and Guidelines</CardTitle>
              </div>
            </div>
            <CardDescription>
              Rules are organized by category and displayed to attendees in the event app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" value={expandedCategories} className="w-full">
              {Object.entries(rulesByCategory).map(([category, rules]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger
                    onClick={() => toggleCategory(category)}
                    className="text-lg font-semibold hover:no-underline"
                  >
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {rules.map(rule => (
                        <Card key={rule.id}>
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{rule.title}</CardTitle>
                              <div className="flex gap-1">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditRule(rule)}
                                      >
                                        <Edit size={15} />
                                        <span className="sr-only">Edit</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteRule(rule)}
                                      >
                                        <Trash2 size={15} />
                                        <span className="sr-only">Delete</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">{rule.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Total: {rules.length} rules across {Object.keys(rulesByCategory).length} categories
            </p>
          </CardFooter>
        </Card>
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminRules;
