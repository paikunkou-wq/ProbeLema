/**
 * PROBELEMA - Municipal Civic Workflow Data Contracts
 */

export type ReportStatus =
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type Priority = 'Not set' | 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportCategory =
  | 'Garbage/Waste'
  | 'Road Damage'
  | 'Streetlight'
  | 'Flooding'
  | 'Drainage'
  | 'Pollution'
  | 'Public Facility'
  | 'Illegal Dumping'
  | 'Other';

export interface TimelineEvent {
  id: string;
  stageTitle: string; // e.g. "Report submitted", "Under verification", "Verified", "Assigned · Environment Dept.", "In progress", "Progress update added", "Resolved", "Archived"
  actor: string; // e.g. "Citizen", "GOV-00231", "GOV-00118"
  timestamp: string; // e.g. "Aug 27, 1:35 PM"
  details?: string;
  badge?: string;
}

export interface ProgressUpdateItem {
  id: string;
  description: string;
  timestamp: string;
  photoUrl?: string;
}

export interface ReportItem {
  id: string; // e.g. "PL-2026-001245"
  category: ReportCategory;
  description: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
    formatted?: string;
  };
  submittedDate: string;
  updatedDate: string;
  status: ReportStatus;
  priority: Priority;
  department?: string; // e.g. "Environment", "Public Works", "Drainage"
  assignedTeam?: string; // e.g. "River Clean-up Unit Alpha"
  assignedOfficer?: string; // e.g. "GOV-00231"
  dueDate?: string;
  internalNotes?: string;
  
  // Verification info
  verifiedOn?: string;
  verifiedBy?: string;

  // Rejection info
  rejectionReason?: string; // e.g. "Duplicate Report"
  rejectionExplanation?: string;
  rejectedOn?: string;
  rejectedBy?: string;

  // Resolution info
  resolutionSummary?: string; // e.g. "Pothole repaired", "Waste cleared"
  resolutionDate?: string;
  resolvedDate?: string;

  // Archival info
  archivedOn?: string;
  archivedBy?: string;

  // Photo slots
  photoUrl?: string;
  beforePhotoUrl?: string;
  progressPhotoUrl?: string;
  afterPhotoUrl?: string;

  progressUpdates: ProgressUpdateItem[];
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  title: string;
  reportId: string;
  timestamp: string;
  read: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  officialId: string;
  avatarUrl?: string;
  authProvider: 'google' | 'government_credentials';
}

export type ViewTab =
  | 'dashboard'
  | 'map'
  | 'reports'
  | 'verification'
  | 'assign'
  | 'in-progress'
  | 'resolved'
  | 'rejected'
  | 'archived'
  | 'notifications'
  | 'settings';
