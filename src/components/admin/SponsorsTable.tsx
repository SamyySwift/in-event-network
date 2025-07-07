import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ExternalLink, Mail, Phone } from 'lucide-react';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';

interface SponsorsTableProps {
  sponsors: any[];
}

export function SponsorsTable({ sponsors }: SponsorsTableProps) {
  const { updateSponsorStatus } = useAdminSponsors();

  const handleStatusChange = (sponsorId: string, newStatus: string) => {
    updateSponsorStatus.mutate({ id: sponsorId, status: newStatus });
  };

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-sm text-muted-foreground">
          No sponsor submissions yet. Share your form to start collecting applications.
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organization</TableHead>
          <TableHead>Contact Person</TableHead>
          <TableHead>Contact Info</TableHead>
          <TableHead>Sponsorship Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sponsors.map((sponsor) => (
          <TableRow key={sponsor.id}>
            <TableCell>
              <div>
                <div className="font-medium">{sponsor.organization_name}</div>
                {sponsor.website_link && (
                  <a 
                    href={sponsor.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Website
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{sponsor.contact_person_name}</div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <a 
                  href={`mailto:${sponsor.email}`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  {sponsor.email}
                </a>
                {sponsor.phone_number && (
                  <a 
                    href={`tel:${sponsor.phone_number}`}
                    className="text-xs text-green-600 hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {sponsor.phone_number}
                  </a>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{sponsor.sponsorship_type}</Badge>
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  sponsor.status === 'approved' ? 'default' : 
                  sponsor.status === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                {sponsor.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm text-muted-foreground">
                {new Date(sponsor.created_at).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(sponsor.id, 'approved')}
                    className="text-green-600"
                  >
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(sponsor.id, 'pending')}
                  >
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange(sponsor.id, 'rejected')}
                    className="text-red-600"
                  >
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}