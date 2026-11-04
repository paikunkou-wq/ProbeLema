import React, { useState } from 'react';
import { useReportStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MapView } from './components/MapView';
import { ReportsListView } from './components/ReportsListView';
import { WorkflowListView } from './components/WorkflowListView';
import { ArchivedListView } from './components/ArchivedListView';
import { ReportDetailView } from './components/ReportDetailView';
import { NotificationsView } from './components/NotificationsView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { ViewTab } from './types';
import { Plus, X } from 'lucide-react';

export default function App() {
  const { currentUser, reports, activeTab, activeReportId, activeWorkflowFrom, actions } =
    useReportStore();

  // Citizen report quick creator modal state (for municipal testing / demonstration)
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<'Garbage/Waste' | 'Road Damage' | 'Streetlight' | 'Flooding' | 'Drainage' | 'Pollution' | 'Other'>('Garbage/Waste');
  const [newLocation, setNewLocation] = useState('Colon Street Corner Osmeña');
  const [newDescription, setNewDescription] = useState('Debris and waste blocking accessway.');

  const activeReport = activeReportId
    ? reports.find((r) => r.id === activeReportId)
    : null;

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `PL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newReport = {
      id: newId,
      category: newCategory,
      description: newDescription,
      locationName: newLocation,
      coordinates: {
        lat: 10.315 + (Math.random() - 0.5) * 0.02,
        lng: 123.885 + (Math.random() - 0.5) * 0.02,
        formatted: '10.31xx, 123.88xx',
      },
      submittedDate: 'Today, Just now',
      updatedDate: 'Just now',
      status: 'SUBMITTED' as const,
      priority: 'Not set' as const,
      timeline: [
        {
          id: `t-${Date.now()}`,
          stageTitle: 'Report submitted',
          actor: 'Citizen',
          timestamp: 'Just now',
        },
      ],
      progressUpdates: [],
    };

    // Prepend to reports
    const current = actions.getReports();
    current.unshift(newReport);
    localStorage.setItem('probelema_reports_v1', JSON.stringify(current));

    // Notify
    const notifs = actions.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}`,
      title: 'New report awaiting verification',
      reportId: newId,
      timestamp: 'Just now',
      read: false,
    });
    localStorage.setItem('probelema_notifications_v1', JSON.stringify(notifs));

    setIsNewReportModalOpen(false);
    actions.setActiveTab('verification');
    actions.openReport(newId, 'verification');
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={() => actions.setActiveTab('dashboard')} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] overflow-hidden text-slate-800 antialiased font-sans">
      {/* Deep Navy Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          actions.setActiveTab(tab);
        }}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          activeReportId={activeReportId}
          fromTab={activeWorkflowFrom}
          onNavigateBreadcrumb={(tab) => {
            actions.setActiveTab(tab);
          }}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC]">
          {activeReport ? (
            <ReportDetailView
              report={activeReport}
              fromTab={activeWorkflowFrom}
              onBack={() => {
                actions.closeReport();
              }}
              onNavigateWorkflow={(stageTab) => {
                actions.setActiveTab(stageTab);
                actions.openReport(activeReport.id, stageTab);
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenReport={(id) => actions.openReport(id, 'dashboard')}
                  onNavigateToWorkflow={(tab) => actions.setActiveTab(tab)}
                  onOpenMap={() => actions.setActiveTab('map')}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  onOpenReport={(id, from) => actions.openReport(id, from || 'map')}
                  onOpenWorkflow={(tab) => actions.setActiveTab(tab)}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsListView
                  onOpenReport={(id, from) => actions.openReport(id, from)}
                />
              )}

              {(activeTab === 'verification' ||
                activeTab === 'assign' ||
                activeTab === 'in-progress' ||
                activeTab === 'resolved' ||
                activeTab === 'rejected') && (
                <WorkflowListView
                  stage={activeTab}
                  onOpenReport={(id, from) => actions.openReport(id, from)}
                />
              )}

              {activeTab === 'archived' && (
                <ArchivedListView
                  onOpenReport={(id, from) => actions.openReport(id, from)}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  onOpenReport={(id) => actions.openReport(id, 'notifications')}
                />
              )}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}

          {/* Quick Municipal Log Incident FAB (useful for testing workflow transitions) */}
          <button
            onClick={() => setIsNewReportModalOpen(true)}
            className="fixed bottom-6 right-6 z-[900] bg-[#0B1238] hover:bg-[#151D4D] text-white p-3.5 rounded-full shadow-xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 select-none"
            title="Log new incoming incident report"
          >
            <Plus className="w-5 h-5 text-[#FFD100]" />
            <span className="hidden md:inline pr-1">New Report</span>
          </button>
        </main>
      </div>

      {/* Quick Incident Creator Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                Log Incoming Citizen Report
              </h2>
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Garbage/Waste">Garbage/Waste</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Streetlight">Streetlight</option>
                  <option value="Flooding">Flooding</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Pollution">Pollution</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Landmark
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Citizen Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B1238] hover:bg-[#151D4D] rounded-lg transition-colors shadow-sm"
                >
                  Submit to Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
