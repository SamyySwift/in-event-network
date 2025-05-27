
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Mock data for rules
const mockRules = [
  {
    id: '1',
    title: 'Professional Conduct',
    content: 'All attendees must maintain professional behavior throughout the event. Harassment of any kind will not be tolerated.',
    category: 'behavior',
    isActive: true,
    createdAt: '2025-06-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Photography Policy',
    content: 'Photography is allowed during networking sessions but prohibited during presentations without prior consent.',
    category: 'media',
    isActive: true,
    createdAt: '2025-06-01T10:15:00Z'
  },
  {
    id: '3',
    title: 'Networking Guidelines',
    content: 'Please exchange contact information respectfully and follow up within 48 hours of meeting.',
    category: 'networking',
    isActive: true,
    createdAt: '2025-06-01T10:30:00Z'
  }
];

const RuleForm = ({ onSubmit, initialData = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: initialData || {
      title: '',
      content: '',
      category: 'general',
      isActive: true
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
        <Label htmlFor="content">Rule Content</Label>
        <Textarea 
          id="content" 
          placeholder="Enter rule content and guidelines" 
          rows={4}
          {...register("content", { required: "Content is required" })}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select defaultValue="general" onValueChange={(value) => setValue('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="behavior">Behavior</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" {...register('category')} />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="isActive" {...register("isActive")} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <div className="flex justify-end pt-2">
        <Button type="submit">Save Rule</Button>
      </div>
    </form>
  );
};

const AdminRules = () => {
  const [rules, setRules] = useState(mockRules);

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (value: string) => (
        <Badge variant={
          value === 'behavior' ? 'default' : 
          value === 'networking' ? 'secondary' : 
          value === 'media' ? 'outline' : 
          value === 'safety' ? 'destructive' : 
          'secondary'
        }>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Content',
      accessorKey: 'content',
      cell: (value: string) => (
        <div className="max-w-xs truncate">
          {value}
        </div>
      ),
    }
  ];

  const handleCreateRule = (ruleData) => {
    const newRule = {
      id: `${rules.length + 1}`,
      ...ruleData,
      createdAt: new Date().toISOString()
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

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Event Rules"
        description="Define and manage event rules and guidelines"
        actionLabel="Add Rule"
        actionForm={<RuleForm onSubmit={handleCreateRule} />}
      >
        <AdminDataTable
          columns={columns}
          data={rules}
          onEdit={handleEditRule}
          onDelete={handleDeleteRule}
        />
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminRules;
