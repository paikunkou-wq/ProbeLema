import React from 'react';
import { ViewTab } from '../types';
import { useReportStore } from '../store';
import { LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { currentUser, notifications, actions } = useReportStore();
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const renderNavItem = (tab: ViewTab, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => onSelectTab(tab)}
        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-150 flex items-center justify-between ${
          isActive
            ? 'bg-[#FFCD13] text-[#0B1370] font-bold shadow-sm'
            : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
        }`}
      >
        <span>{label}</span>
        {tab === 'notifications' && unreadNotifsCount > 0 && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              isActive ? 'bg-[#0B1370] text-white' : 'bg-[#FFCD13] text-[#0B1370]'
            }`}
          >
            {unreadNotifsCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-[#0B1370] text-white flex flex-col shrink-0 h-screen select-none border-r border-blue-900/30">
      {/* Brand Header with Official Vector Mark */}
      <div className="p-5 pb-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 shrink-0">
          <svg viewBox="0 0 100 143.6" className="w-6 h-auto" fill="none">
            {/* Blue upper right */}
            <path
              d="M17.6 11.9L28.1 26.8L33.8 22.4L39.2 19.8L45.2 18.2L52.3 17.9L56.7 18.5L62.5 20.4L68.0 23.5L73.0 27.9L76.5 32.3L79.1 37.4L80.5 41.6L81.5 46.8L81.5 52.7L80.4 58.6L78.2 64.2L75.0 69.4L87.0 86.0L92.5 75.4L97.2 63.9L99.5 55.3L100.0 47.4L98.9 39.2L95.9 30.0L91.5 22.0L86.5 15.7L79.6 9.6L71.1 4.6L63.4 1.7L53.1 0.0L43.6 0.3L34.5 2.4L25.6 6.3Z"
              fill="#0018FF"
            />
            {/* Yellow upper left */}
            <path
              d="M17.4 12.1L13.7 15.5L10.2 19.6L4.4 29.4L1.3 38.6L0.0 48.7L0.5 55.1L3.3 65.1L8.5 77.2L14.8 89.0L27.0 71.7L23.4 66.7L20.7 61.4L18.7 52.7L18.7 46.8L19.2 43.5L21.0 37.4L24.0 31.9L27.9 27.0Z"
              fill="#FFCD13"
            />
            {/* Red bottom triangle */}
            <path
              d="M27.2 71.7L14.9 89.0L22.6 102.2L34.5 120.3L39.2 125.0L43.5 127.2L48.5 128.3L54.6 127.8L60.6 125.1L62.6 123.5L65.8 119.9L79.1 99.2L64.4 78.3L59.2 80.4L54.2 81.5L47.6 81.6L40.5 80.2L35.3 78.0L30.6 74.9Z"
              fill="#D60E00"
            />
            {/* Red ground dot */}
            <path
              d="M40.5 137.0L40.5 139.4L41.8 141.3L44.7 143.0L47.9 143.6L51.6 143.3L54.5 142.2L56.0 141.0L57.1 138.8L57.0 136.9L55.1 134.5L50.5 132.8L46.9 132.8L44.1 133.6L42.2 134.7Z"
              fill="#D60E00"
            />
          </svg>
        </div>
        <div>
          <div className="font-bold text-lg tracking-[2px] text-white leading-tight">
            PROBE<span className="text-[#FFCD13]">LEMA</span>
          </div>
          <div className="text-[10px] text-blue-200/70 font-medium tracking-wide">
            GOVERNMENT PORTAL
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {/* Main */}
        <div className="space-y-1">
          {renderNavItem('dashboard', 'Dashboard')}
          {renderNavItem('map', 'Map')}
          {renderNavItem('reports', 'Reports')}
        </div>

        {/* WORKFLOW */}
        <div className="space-y-1">
          <div className="px-4 text-[11px] font-bold tracking-[0.15em] text-blue-200/50 uppercase mb-2">
            WORKFLOW
          </div>
          {renderNavItem('verification', 'Verification')}
          {renderNavItem('assign', 'Assign')}
          {renderNavItem('in-progress', 'In Progress')}
          {renderNavItem('resolved', 'Resolved')}
          {renderNavItem('rejected', 'Rejected')}
        </div>

        {/* RECORDS */}
        <div className="space-y-1">
          <div className="px-4 text-[11px] font-bold tracking-[0.15em] text-blue-200/50 uppercase mb-2">
            RECORDS
          </div>
          {renderNavItem('archived', 'Archived')}
        </div>

        {/* SYSTEM */}
        <div className="space-y-1">
          <div className="px-4 text-[11px] font-bold tracking-[0.15em] text-blue-200/50 uppercase mb-2">
            SYSTEM
          </div>
          {renderNavItem('notifications', 'Notifications')}
          {renderNavItem('settings', 'Settings')}
        </div>
      </div>

      {/* User Session Footer with Sign out */}
      <div className="p-3.5 border-t border-blue-900/40 bg-blue-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-[#FFCD13] shrink-0">
            {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'JD'}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">
              {currentUser?.name || 'Juan Dela Cruz'}
            </div>
            <div className="text-[10px] text-blue-200/70 truncate">
              {currentUser?.officialId || 'GOV-00231'}
            </div>
          </div>
        </div>
        <button
          onClick={() => actions.logout()}
          title="Sign out to Login Screen"
          className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
