import React, { useState } from 'react';
import { useReportStore } from '../store';

export const SettingsView: React.FC = () => {
  const { settings, actions } = useReportStore();
  const [activeTab, setActiveTab] = useState<
    | 'notifications'
    | 'map'
    | 'categories'
    | 'status'
    | 'retention'
    | 'account'
  >('notifications');

  const tabs = [
    { key: 'notifications', label: 'Notifications' },
    { key: 'map', label: 'Map' },
    { key: 'categories', label: 'Report Categories' },
    { key: 'status', label: 'Status Configuration' },
    { key: 'retention', label: 'Retention Settings' },
    { key: 'account', label: 'Account Settings' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1370] tracking-tight">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left Tabs Column */}
        <div className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium cursor-pointer ${
                  isActive
                    ? 'bg-[#FFCD13] text-[#0B1370] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Card matching wireframe */}
        <div className="md:col-span-3 bg-white rounded-xl border border-slate-200 p-8 shadow-xs min-h-[420px] flex flex-col justify-between">
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-[#0B1370]">Notifications</h2>

              <div className="space-y-3.5 text-sm font-medium text-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyNewReport}
                    onChange={(e) =>
                      actions.updateSettings({ notifyNewReport: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>New report awaiting verification</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyProgressUpdate}
                    onChange={(e) =>
                      actions.updateSettings({ notifyProgressUpdate: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>Progress update added</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyDailySummary}
                    onChange={(e) =>
                      actions.updateSettings({ notifyDailySummary: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>Daily summary</span>
                </label>
              </div>

              {/* No-update threshold (days) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  No-update threshold (days)
                </label>
                <input
                  type="number"
                  value={settings.noUpdateThresholdDays}
                  onChange={(e) =>
                    actions.updateSettings({
                      noUpdateThresholdDays: parseInt(e.target.value, 10) || 7,
                    })
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Map Configuration</h2>
              <div className="text-sm text-slate-600 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Default Municipal Center Coordinates
                  </label>
                  <input
                    type="text"
                    defaultValue="10.3165, 123.8860 (City Hall Sector 1)"
                    readOnly
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Incident Marker Clustering Threshold
                  </label>
                  <input
                    type="number"
                    defaultValue={14}
                    className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Report Categories</h2>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                {[
                  'Garbage/Waste (Environment)',
                  'Road Damage (Public Works)',
                  'Flooding (Drainage)',
                  'Drainage (Drainage)',
                  'Streetlight (Public Works)',
                  'Pollution (Environment)',
                  'Public Facility (Public Works)',
                  'Illegal Dumping (Environment)',
                  'Other (General Administration)',
                ].map((c) => (
                  <div key={c} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Status Configuration</h2>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">1. Verification</span>
                  <span className="text-slate-500">Citizen submitted evidence review</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">2. Assignment</span>
                  <span className="text-slate-500">Department & field team dispatch</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">3. In Progress</span>
                  <span className="text-slate-500">Active remediation & progress photos</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">4. Resolved</span>
                  <span className="text-slate-500">Work completed & citizen notified</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-800">5. Archived</span>
                  <span className="text-slate-500">Permanent non-deletable records</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'retention' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Retention Settings</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                In compliance with municipal governance transparency laws, citizen reports,
                timelines, and resolution documents are permanently archived and cannot be
                purged from the portal.
              </p>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Account Settings</h2>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500">Official Name:</span>
                  <div className="font-bold text-sm text-slate-800">Juan Dela Cruz</div>
                </div>
                <div>
                  <span className="text-slate-500">Official ID:</span>
                  <div className="font-mono text-sm text-slate-800">GOV-00231</div>
                </div>
                <div>
                  <span className="text-slate-500">Designation & Department:</span>
                  <div className="text-sm text-slate-800">Senior Field Inspector · Environment Department</div>
                </div>
              </div>
            </div>
          )}

          {/* Footnote matching wireframe */}
          <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
            Administrative sections (categories, status configuration, retention) are visible
            to administrators only.
          </div>
        </div>
      </div>
    </div>
  );
};
