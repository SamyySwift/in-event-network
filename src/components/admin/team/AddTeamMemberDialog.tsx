
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar } from 'lucide-react';
import { DASHBOARD_SECTIONS } from '@/hooks/useTeamManagement';

interface AddTeamMemberDialogProps {
  onAddMember: (data: {
    email: string;
    allowed_sections: string[];
    expires_at?: string;
  }) => void;
  isLoading?: boolean;
}

export function AddTeamMemberDialog({ onAddMember, isLoading }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [expirationDays, setExpirationDays] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || selectedSections.length === 0) return;

    let expires_at: string | undefined;
    if (expirationDays && expirationDays !== 'never') {
      const days = parseInt(expirationDays);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      expires_at = expirationDate.toISOString();
    }

    onAddMember({
      email,
      allowed_sections: selectedSections,
      expires_at,
    });

    // Reset form
    setEmail('');
    setSelectedSections([]);
    setExpirationDays('');
    setOpen(false);
  };

  const toggleSection = (sectionValue: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionValue)
        ? prev.filter(s => s !== sectionValue)
        : [...prev, sectionValue]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammember@example.com"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Dashboard Access Permissions</Label>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {DASHBOARD_SECTIONS.map((section) => (
                <div key={section.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={section.value}
                    checked={selectedSections.includes(section.value)}
                    onCheckedChange={() => toggleSection(section.value)}
                  />
                  <Label
                    htmlFor={section.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSections.length === 0 && (
              <p className="text-sm text-red-500">Please select at least one section</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Access Duration</Label>
            <Select value={expirationDays} onValueChange={setExpirationDays}>
              <SelectTrigger>
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !email || selectedSections.length === 0}
            >
              {isLoading ? 'Creating...' : 'Create Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
