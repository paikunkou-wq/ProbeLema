import React from 'react';
import { ViewTab } from '../types';
import { useReportStore } from '../store';
import { Database, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: ViewTab;
  activeReportId: string | null;
  fromTab: ViewTab | null;
  onNavigateBreadcrumb: (tab: ViewTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeReportId,
  fromTab,
  onNavigateBreadcrumb,
}) => {
  const { currentUser, reports, actions } = useReportStore();
  const activeReport = activeReportId ? reports.find((r) => r.id === activeReportId) : null;

  // Render breadcrumbs matching wireframes
  const renderBreadcrumbs = () => {
    if (activeReport) {
      const source = fromTab || activeTab;
      const isWorkflow = [
        'verification',
        'assign',
        'in-progress',
        'resolved',
        'rejected',
      ].includes(source);
      const isRecords = source === 'archived';

      if (isWorkflow) {
        const stageLabel =
          source === 'verification'
            ? 'Verification'
            : source === 'assign'
            ? 'Assign'
            : source === 'in-progress'
            ? 'In Progress'
            : source === 'resolved'
            ? 'Resolved'
            : 'Rejected';

        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <button
              onClick={() => onNavigateBreadcrumb(source)}
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              {stageLabel}
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900 font-mono">{activeReport.id}</span>
          </div>
        );
      }

      if (isRecords) {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Records</span>
            <span>/</span>
            <button
              onClick={() => onNavigateBreadcrumb('archived')}
              className="text-slate-700 hover:text-slate-900 font-medium"
            >
              Archived
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900 font-mono">{activeReport.id}</span>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => onNavigateBreadcrumb('reports')}
            className="text-slate-700 hover:text-slate-900 font-medium"
          >
            Reports
          </button>
          <span>/</span>
          <span className="font-bold text-slate-900 font-mono">{activeReport.id}</span>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <div className="text-sm font-semibold text-slate-800">Dashboard</div>;
      case 'map':
        return <div className="text-sm font-semibold text-slate-800">Map</div>;
      case 'reports':
        return <div className="text-sm font-semibold text-slate-800">Reports</div>;
      case 'verification':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Verification</span>
          </div>
        );
      case 'assign':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Assign</span>
          </div>
        );
      case 'in-progress':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <span className="font-bold text-slate-900">In Progress</span>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Resolved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workflow</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Rejected</span>
          </div>
        );
      case 'archived':
        return (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Records</span>
            <span>/</span>
            <span className="font-bold text-slate-900">Archived</span>
          </div>
        );
      case 'notifications':
        return <div className="text-sm font-semibold text-slate-800">Notifications</div>;
      case 'settings':
        return <div className="text-sm font-semibold text-slate-800">Settings</div>;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left Breadcrumb */}
      <div>{renderBreadcrumbs()}</div>

      {/* Right Controls: Database Mode Quick Switcher + Government Official Profile */}
      <div className="flex items-center gap-6">
        {/* Sample Generator Controls */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => actions.seedSampleData()}
            title="Load realistic wireframe cases"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 font-semibold rounded-md shadow-sm border border-slate-200/80 hover:bg-slate-50 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-blue-700" />
            <span>Load Wireframe Data</span>
          </button>
          <button
            onClick={() => actions.clearData()}
            title="Clear all cases to blank slate"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-rose-700 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Slate</span>
          </button>
        </div>

        {/* User Profile Lockup matching wireframe: Juan Dela Cruz with Sign out */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-[#0B1370] leading-tight">
              {currentUser?.name || 'Juan Dela Cruz'}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              {currentUser?.department || 'Environment Department'}
            </div>
          </div>
          <button
            onClick={() => actions.logout()}
            title="Sign out to Login Screen"
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#D60E00] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
