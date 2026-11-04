import React from 'react';
import { useReportStore } from '../store';
import { Bell } from 'lucide-react';

interface NotificationsViewProps {
  onOpenReport: (reportId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onOpenReport }) => {
  const { notifications, actions } = useReportStore();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1370] tracking-tight">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a notification to open the report.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                actions.markNotificationRead(item.id);
                onOpenReport(item.reportId);
              }}
              className={`bg-white rounded-xl border p-4.5 flex items-start gap-4 cursor-pointer transition-all hover:border-[#0018FF]/40 hover:shadow-xs ${
                !item.read ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0018FF] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#0B1370] leading-tight">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  <span className="font-semibold text-[#0018FF]">{item.reportId}</span> ·{' '}
                  <span className="font-sans">{item.timestamp}</span>
                </div>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#0018FF] mt-2 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
