import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Calendar,
  Users,
  Megaphone,
  BarChart,
  MapPin,
  Ticket,
  Clock,
  User,
  Bell,
  MessageSquare,
  Gamepad2,
  Star,
  Settings,
  DollarSign,
  Scan,
  Camera,
  BookOpen,
} from 'lucide-react';

const guideContent = [
  {
    id: 'events',
    title: 'Events Management',
    icon: Calendar,
    description: 'Create and manage your events',
    steps: [
      'Navigate to Events page from the sidebar',
      'Click "Create Event" to add a new event',
      'Fill in event details: name, description, dates, and location',
      'Upload an event banner image (AI will auto-extract event info)',
      'Your event will get a unique QR code for attendee access',
      'Edit or delete events anytime from the Events page',
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets & Sales',
    icon: Ticket,
    description: 'Set up ticket types and manage sales',
    steps: [
      'Go to Tickets page after creating an event',
      'Create ticket types (e.g., Early Bird, VIP, Regular)',
      'Set pricing and available quantity for each type',
      'Share your ticket purchase link with attendees',
      'Track sales and revenue in your Wallet',
      'Export ticket data anytime for your records',
    ],
  },
  {
    id: 'check-in',
    title: 'Check-In Management',
    icon: Scan,
    description: 'Check in attendees at your event',
    steps: [
      'Navigate to Check-In page on event day',
      'Use QR code scanner to scan attendee tickets',
      'Search by name or ticket number for manual check-in',
      'View real-time check-in statistics',
      'Share the public check-in link for self-service',
    ],
  },
  {
    id: 'attendees',
    title: 'Attendee Management',
    icon: Users,
    description: 'View and manage your event attendees',
    steps: [
      'View all registered attendees in the Attendees page',
      'Filter by ticket type, check-in status, or search by name',
      'Export attendee list as CSV for external use',
      'Bulk operations for managing large groups',
      'View networking connections between attendees',
    ],
  },
  {
    id: 'speakers',
    title: 'Speakers & Sessions',
    icon: User,
    description: 'Add speakers and assign them to sessions',
    steps: [
      'Go to Speakers page to add presenters',
      'Upload speaker photos (AI will auto-identify public figures)',
      'Use "Generate Bio" to auto-fill speaker information',
      'Assign speakers to schedule sessions',
      'Add social media links for attendee networking',
    ],
  },
  {
    id: 'schedule',
    title: 'Event Schedule',
    icon: Clock,
    description: 'Build your event agenda',
    steps: [
      'Navigate to Schedule page',
      'Add sessions, breaks, and activities',
      'Set date, time, and duration for each item',
      'Assign locations and priority levels',
      'Upload session images for visual appeal',
      'Attendees will see schedule in their app',
    ],
  },
  {
    id: 'announcements',
    title: 'Announcements',
    icon: Megaphone,
    description: 'Send updates to your attendees',
    steps: [
      'Go to Announcements page',
      'Create announcements with title and content',
      'Set priority level (High, Normal, Low)',
      'Add images and social media links',
      'Record voice notes for audio announcements',
      'Attendees receive real-time notifications',
    ],
  },
  {
    id: 'polls',
    title: 'Polls & Surveys',
    icon: BarChart,
    description: 'Engage attendees with interactive polls',
    steps: [
      'Navigate to Polls & Surveys page',
      'Create polls with custom questions',
      'Use AI to generate poll options automatically',
      'Enable "Allow Multiple Selections" for multi-choice',
      'View real-time voting results',
      'Share live poll view link for presentations',
    ],
  },
  {
    id: 'facilities',
    title: 'Facilities & Venue Info',
    icon: MapPin,
    description: 'Set up venue information',
    steps: [
      'Go to Facilities page',
      'Add venue locations (restrooms, parking, stages)',
      'Include contact information and directions',
      'Upload photos and record voice descriptions',
      'Attendees can view facility map in their app',
    ],
  },
  {
    id: 'games',
    title: 'Interactive Games',
    icon: Gamepad2,
    description: 'Run quizzes and games',
    steps: [
      'Navigate to Games page',
      'Create quiz games with questions',
      'Set up word search puzzles',
      'View leaderboards and participation',
      'Share game links for audience participation',
    ],
  },
  {
    id: 'sponsors',
    title: 'Sponsors & Partners',
    icon: Star,
    description: 'Manage event sponsors',
    steps: [
      'Go to Sponsors & Partners page',
      'Add sponsor organizations with logos',
      'Set sponsorship tiers (Platinum, Gold, Silver)',
      'Include sponsor contact information',
      'Create sponsor forms for lead capture',
    ],
  },
  {
    id: 'wallet',
    title: 'Wallet & Payments',
    icon: DollarSign,
    description: 'Manage your earnings',
    steps: [
      'Navigate to Wallet page',
      'View total earnings and available balance',
      'Add your bank account for withdrawals',
      'Request withdrawals to your bank account',
      'Track transaction history',
    ],
  },
  {
    id: 'settings',
    title: 'Event Settings',
    icon: Settings,
    description: 'Customize your event branding',
    steps: [
      'Go to Settings page',
      'Upload custom logo and banner',
      'Set event colors and fonts',
      'Configure event title and description',
      'Enable/disable various features',
    ],
  },
];

const AdminGuide = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:from-primary-900/50 dark:via-blue-900/50 dark:to-indigo-900/50 dark:text-white shadow-2xl shadow-primary/10 relative overflow-hidden">
        <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Admin Guide</h1>
              <p className="mt-1 text-primary-700 dark:text-primary-100">
                Complete documentation for managing your events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Feature Documentation</CardTitle>
          <CardDescription>
            Click on each section to learn how to use the feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {guideContent.map((section) => {
              const Icon = section.icon;
              return (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{section.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {section.description}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-12 pr-4 py-2">
                      <ol className="space-y-3">
                        {section.steps.map((step, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-sm text-muted-foreground"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGuide;
