export interface User {
  id: string;
  name: string;
  email: string;
  role: "host" | "attendee";
  photoUrl?: string;
  bio?: string;
  links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    github?: string;
    website?: string;
  };
  niche?: string;
  networkingPreferences?: string[];
  customTags?: string[];
}

export interface Speaker {
  id: string;
  name: string;
  photoUrl?: string;
  bio?: string;
  sessionTopics?: string[];
  links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
    tiktok?: string;
  };
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
  location?: string;
  tags?: string[];
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  bannerUrl?: string;
  logoUrl?: string;
  website?: string;
  location?: string;
  hostId: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  qrCode?: string;
  isEnded?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  duration?: number;
  notificationType?: "push" | "email" | "in-app";
}

export interface Question {
  id: string;
  question: string;
  sessionId: string;
  userId: string;
  speakerId?: string;
  upvotes: number;
  answered: boolean;
  createdAt: string;
  isAnonymous?: boolean;
  answer?: string;
  answerSatisfactionRating?: number;
}

export interface Suggestion {
  id: string;
  content: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  feedback?: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  type: "restroom" | "emergency" | "food" | "accessibility" | "parking" | "entry" | "exit" | "other";
  location: string;
  description?: string;
  icon?: string;
}

export interface Connection {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Notification {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  read: boolean;
  type: "announcement" | "connection" | "schedule" | "question" | "other";
  linkTo?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  startTime: string;
  endTime: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  showResults: boolean;
  displayAsBanner: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  timestamp: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sponsorName: string;
  sponsorLogo?: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
}

export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  startTime: string;
  endTime: string;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  isAnonymous: boolean;
  displayAsBanner: boolean;
}

export interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'checkbox';
  question: string;
  options?: string[];
  required: boolean;
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId?: string;
  responses: { [questionId: string]: any };
  submittedAt: string;
}

// Update the Facility interface to include new fields
export interface Facility {
  id: string;
  name: string;
  type: "restroom" | "emergency" | "food" | "accessibility" | "parking" | "entry" | "exit" | "other";
  location: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  rules?: string;
  contactType?: 'call' | 'text' | 'whatsapp' | null;
  contactNumber?: string;
}

// Update the Question interface
export interface Question {
  id: string;
  question: string;
  sessionId: string;
  userId: string;
  speakerId?: string;
  upvotes: number;
  answered: boolean;
  createdAt: string;
  isAnonymous?: boolean;
  answer?: string;
  answerSatisfactionRating?: number;
  userNotified?: boolean;
}

// Update the Suggestion interface
export interface Suggestion {
  id: string;
  content: string;
  userId: string;
  eventId: string;
  createdAt: string;
  type: 'suggestion' | 'rating';
  rating?: number;
}
