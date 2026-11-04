import { useState, useEffect } from 'react';
import { ReportItem, NotificationItem, ViewTab, ReportStatus, Priority, AuthUser } from './types';
import { INITIAL_REPORTS, INITIAL_NOTIFICATIONS } from './mockData';

const STORAGE_KEY_REPORTS = 'probelema_reports_v1';
const STORAGE_KEY_NOTIFS = 'probelema_notifications_v1';
const STORAGE_KEY_SETTINGS = 'probelema_settings_v1';
const STORAGE_KEY_AUTH = 'probelema_auth_user_v1';

export const DEFAULT_AUTH_USER: AuthUser = {
  id: 'usr-00231',
  name: 'Juan Dela Cruz',
  email: 'name@agency.gov',
  department: 'Environment Department',
  role: 'Senior Field Inspector',
  officialId: 'GOV-00231',
  avatarUrl: undefined,
  authProvider: 'google',
};

export interface AppSettings {
  notifyNewReport: boolean;
  notifyProgressUpdate: boolean;
  notifyDailySummary: boolean;
  noUpdateThresholdDays: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  notifyNewReport: true,
  notifyProgressUpdate: true,
  notifyDailySummary: false,
  noUpdateThresholdDays: 7,
};

// Simple global pub/sub for reactive hook updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

// Global store state in memory + localStorage
let reports: ReportItem[] = [];
let notifications: NotificationItem[] = [];
let settings: AppSettings = DEFAULT_SETTINGS;
let currentUser: AuthUser | null = DEFAULT_AUTH_USER;
let activeTab: ViewTab = 'dashboard';
let activeReportId: string | null = null;
let activeWorkflowFrom: ViewTab | null = null;

// Initialize from storage or default to wireframe cases
function initStore() {
  try {
    const savedReports = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (savedReports) {
      reports = JSON.parse(savedReports);
    } else {
      reports = [...INITIAL_REPORTS];
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    }

    const savedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (savedNotifs) {
      notifications = JSON.parse(savedNotifs);
    } else {
      notifications = [...INITIAL_NOTIFICATIONS];
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    }

    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }

    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth !== null) {
      try {
        currentUser = JSON.parse(savedAuth);
      } catch {
        currentUser = DEFAULT_AUTH_USER;
      }
    }
  } catch (e) {
    console.warn('Storage init failed, using defaults', e);
    reports = [...INITIAL_REPORTS];
    notifications = [...INITIAL_NOTIFICATIONS];
  }
}

initStore();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  } catch (e) {
    console.error('Failed to persist to localStorage', e);
  }
  notify();
}

export const appStore = {
  getCurrentUser(): AuthUser | null {
    return currentUser;
  },

  loginWithGoogle(email = 'juan.delacruz@environment.gov.ph', name = 'Juan Dela Cruz') {
    currentUser = {
      id: 'usr-google',
      name,
      email,
      department: 'Environment Department',
      role: 'Senior Field Inspector',
      officialId: 'GOV-00231',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      authProvider: 'google',
    };
    activeTab = 'dashboard';
    persist();
  },

  loginWithCredentials(email: string, _password?: string) {
    const isEnv = email.toLowerCase().includes('environment') || email.toLowerCase().includes('juan');
    currentUser = {
      id: 'usr-00231',
      name: isEnv ? 'Juan Dela Cruz' : 'Maria Santos',
      email: email || 'name@agency.gov',
      department: isEnv ? 'Environment Department' : 'Public Works Department',
      role: isEnv ? 'Senior Field Inspector' : 'Municipal Engineer',
      officialId: isEnv ? 'GOV-00231' : 'GOV-00118',
      authProvider: 'government_credentials',
    };
    activeTab = 'dashboard';
    persist();
  },

  logout() {
    currentUser = null;
    persist();
  },

  getReports(): ReportItem[] {
    return reports;
  },
  getNotifications(): NotificationItem[] {
    return notifications;
  },
  getSettings(): AppSettings {
    return settings;
  },
  getActiveTab(): ViewTab {
    return activeTab;
  },
  getActiveReportId(): string | null {
    return activeReportId;
  },
  getActiveWorkflowFrom(): ViewTab | null {
    return activeWorkflowFrom;
  },

  setActiveTab(tab: ViewTab) {
    activeTab = tab;
    activeReportId = null;
    notify();
  },

  openReport(id: string, fromTab?: ViewTab) {
    activeReportId = id;
    if (fromTab) {
      activeWorkflowFrom = fromTab;
    }
    notify();
  },

  closeReport() {
    activeReportId = null;
    notify();
  },

  updateSettings(newSettings: Partial<AppSettings>) {
    settings = { ...settings, ...newSettings };
    persist();
  },

  verifyReport(id: string, actor = 'GOV-00231') {
    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

      return {
        ...r,
        status: 'VERIFIED' as ReportStatus,
        verifiedOn: 'Today',
        verifiedBy: actor,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: 'Verified',
            actor,
            timestamp,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Report verified: ready to assign',
      reportId: id,
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  rejectReport(id: string, reason: string, explanation: string, actor = 'GOV-00231') {
    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

      return {
        ...r,
        status: 'REJECTED' as ReportStatus,
        rejectionReason: reason,
        rejectionExplanation: explanation,
        rejectedOn: 'Today',
        rejectedBy: actor,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: `Rejected · ${reason}`,
            actor,
            timestamp,
            details: explanation,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Report rejected',
      reportId: id,
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  assignReport(
    id: string,
    data: {
      department: string;
      assignedTeam: string;
      priority: Priority;
      dueDate?: string;
      internalNotes?: string;
    },
    actor = 'GOV-00231'
  ) {
    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

      return {
        ...r,
        status: 'ASSIGNED' as ReportStatus,
        department: data.department,
        assignedTeam: data.assignedTeam,
        priority: data.priority,
        dueDate: data.dueDate || 'TBD',
        internalNotes: data.internalNotes,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: `Assigned · ${data.department} Dept.`,
            actor,
            timestamp,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Report assigned',
      reportId: id,
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  batchVerify(ids: string[], actor = 'GOV-00231') {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    const idSet = new Set(ids);
    reports = reports.map((r) => {
      if (!idSet.has(r.id)) return r;
      return {
        ...r,
        status: 'VERIFIED' as ReportStatus,
        verifiedOn: 'Today',
        verifiedBy: actor,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}-${r.id}`,
            stageTitle: 'Verified (Batch Action)',
            actor,
            timestamp,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Batch verified ${ids.length} reports`,
      reportId: ids[0],
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  batchReject(ids: string[], reason: string, explanation: string, actor = 'GOV-00231') {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    const idSet = new Set(ids);
    reports = reports.map((r) => {
      if (!idSet.has(r.id)) return r;
      return {
        ...r,
        status: 'REJECTED' as ReportStatus,
        rejectionReason: reason,
        rejectionExplanation: explanation,
        rejectedOn: 'Today',
        rejectedBy: actor,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}-${r.id}`,
            stageTitle: `Rejected (Batch Action) · ${reason}`,
            actor,
            timestamp,
            details: explanation,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Batch rejected ${ids.length} reports`,
      reportId: ids[0],
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  batchAssign(
    ids: string[],
    data: {
      department: string;
      assignedTeam: string;
      priority: Priority;
      dueDate?: string;
      internalNotes?: string;
    },
    actor = 'GOV-00231'
  ) {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    const idSet = new Set(ids);
    reports = reports.map((r) => {
      if (!idSet.has(r.id)) return r;
      return {
        ...r,
        status: 'ASSIGNED' as ReportStatus,
        department: data.department,
        assignedTeam: data.assignedTeam,
        priority: data.priority,
        dueDate: data.dueDate || 'TBD',
        internalNotes: data.internalNotes,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}-${r.id}`,
            stageTitle: `Assigned (Batch Action) · ${data.department} Dept.`,
            actor,
            timestamp,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Batch assigned ${ids.length} reports to ${data.department}`,
      reportId: ids[0],
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  startAction(id: string, actor = 'GOV-00231') {
    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

      return {
        ...r,
        status: 'IN_PROGRESS' as ReportStatus,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: 'In progress',
            actor,
            timestamp,
          },
        ],
      };
    });

    persist();
  },

  addProgressUpdate(
    id: string,
    data: { description: string; photoUrl?: string; timestamp?: string },
    actor = 'GOV-00231'
  ) {
    const formattedTime =
      data.timestamp ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const newUpdate = {
        id: `prog-${Date.now()}`,
        description: data.description,
        timestamp: formattedTime,
        photoUrl: data.photoUrl,
      };

      return {
        ...r,
        updatedDate: 'Just now',
        progressPhotoUrl: data.photoUrl || r.progressPhotoUrl,
        progressUpdates: [...r.progressUpdates, newUpdate],
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: 'Progress update added',
            actor,
            timestamp: formattedTime,
            details: data.description,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Progress update added',
      reportId: id,
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  resolveReport(
    id: string,
    data: { description: string; photoUrl?: string; resolutionDate?: string },
    actor = 'GOV-00231'
  ) {
    const formattedTime =
      data.resolutionDate ||
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

    reports = reports.map((r) => {
      if (r.id !== id) return r;

      return {
        ...r,
        status: 'RESOLVED' as ReportStatus,
        resolutionSummary: data.description,
        resolvedDate: 'Today',
        afterPhotoUrl: data.photoUrl || r.afterPhotoUrl,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: 'Resolved',
            actor,
            timestamp: formattedTime,
            details: data.description,
          },
        ],
      };
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Report resolved',
      reportId: id,
      timestamp: 'Just now',
      read: false,
    });

    persist();
  },

  archiveReport(id: string, actor = 'GOV-00231') {
    reports = reports.map((r) => {
      if (r.id !== id) return r;
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) + `, ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

      return {
        ...r,
        status: 'ARCHIVED' as ReportStatus,
        archivedOn: 'Today',
        archivedBy: actor,
        updatedDate: 'Just now',
        timeline: [
          ...r.timeline,
          {
            id: `t-${Date.now()}`,
            stageTitle: 'Archived',
            actor,
            timestamp,
          },
        ],
      };
    });

    persist();
  },

  seedSampleData() {
    reports = [...INITIAL_REPORTS];
    notifications = [...INITIAL_NOTIFICATIONS];
    persist();
  },

  clearData() {
    reports = [];
    notifications = [];
    persist();
  },

  markNotificationRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    persist();
  },
};

// React hook
export function useReportStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const allReports = appStore.getReports();

  // Wireframe statistics
  // If reports are present, we calculate dynamic counts while preserving wireframe minimum counts if desired
  const totalReportsCount = allReports.length === 0 ? 0 : 1284 + (allReports.length - INITIAL_REPORTS.length);
  const awaitingVerificationCount = allReports.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'UNDER_VERIFICATION'
  ).length;
  const toAssignCount = allReports.filter((r) => r.status === 'VERIFIED').length;
  const inProgressCount = allReports.filter(
    (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = allReports.filter((r) => r.status === 'RESOLVED').length;
  const rejectedCount = allReports.filter((r) => r.status === 'REJECTED').length;
  const archivedCount = allReports.filter((r) => r.status === 'ARCHIVED').length;

  return {
    currentUser: appStore.getCurrentUser(),
    reports: allReports,
    notifications: appStore.getNotifications(),
    settings: appStore.getSettings(),
    activeTab: appStore.getActiveTab(),
    activeReportId: appStore.getActiveReportId(),
    activeWorkflowFrom: appStore.getActiveWorkflowFrom(),
    counts: {
      total: allReports.length === 0 ? 0 : totalReportsCount,
      awaitingVerification: allReports.length === 0 ? 0 : (awaitingVerificationCount > 4 ? awaitingVerificationCount : 126),
      toAssign: allReports.length === 0 ? 0 : (toAssignCount > 3 ? toAssignCount : 64),
      inProgress: allReports.length === 0 ? 0 : (inProgressCount > 3 ? inProgressCount : 451),
      resolved: allReports.length === 0 ? 0 : (resolvedCount > 4 ? resolvedCount : 574),
      rejected: allReports.length === 0 ? 0 : (rejectedCount > 4 ? rejectedCount : 69),
      archived: allReports.length === 0 ? 0 : (archivedCount > 3 ? archivedCount : 320),
    },
    actions: appStore,
  };
}
