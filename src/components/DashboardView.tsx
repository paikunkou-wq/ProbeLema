import React from 'react';
import { useReportStore } from '../store';
import { StatusBadge } from './StatusBadge';
import { MapPin, ArrowRight, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  onOpenReport: (id: string) => void;
  onNavigateToWorkflow: (tab: any) => void;
  onOpenMap: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenReport,
  onNavigateToWorkflow,
  onOpenMap,
}) => {
  const { currentUser, reports, counts } = useReportStore();

  // Pick recent reports for the dashboard table matching wireframe
  const recentReports = reports.slice(0, 5);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7 select-none">
      {/* Welcome Greeting Header inspired by reference image */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0018FF] tracking-tight">
            Welcome back, {currentUser?.name || 'Juan Dela Cruz'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Here's what's happening across municipal operations today
          </p>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-500 font-medium">
          <div>{formattedDate}</div>
          <div className="font-bold text-[#0B1370] font-mono mt-0.5">{formattedTime}</div>
        </div>
      </div>

      {/* 4 Vibrant Metric KPI Cards with Trend & SLA Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vibrant Blue - Total Reports */}
        <div
          onClick={() => onNavigateToWorkflow('reports')}
          className="bg-[#0018FF] hover:bg-[#0014D4] p-6 rounded-2xl shadow-md shadow-blue-600/15 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between text-white min-h-[160px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Users className="w-3.5 h-3.5" />
                <span>Total Reports</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                +8.4% wk
              </span>
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
              {counts.total.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-white/15 text-[11px] text-white/80 flex items-center justify-between">
            <span>Citywide Intake</span>
            <span className="font-semibold text-white">99% Geo-tagged</span>
          </div>
        </div>

        {/* Card 2: Vibrant Green - Resolved Cases */}
        <div
          onClick={() => onNavigateToWorkflow('resolved')}
          className="bg-[#059669] hover:bg-[#047857] p-6 rounded-2xl shadow-md shadow-emerald-600/15 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between text-white min-h-[160px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolved Cases</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                +14.2% vs prev
              </span>
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
              {counts.resolved.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-white/15 text-[11px] text-white/80 flex items-center justify-between">
            <span>SLA Compliance</span>
            <span className="font-semibold text-white">94% On-time</span>
          </div>
        </div>

        {/* Card 3: Vibrant Orange - In Progress */}
        <div
          onClick={() => onNavigateToWorkflow('in-progress')}
          className="bg-[#D97706] hover:bg-[#B45309] p-6 rounded-2xl shadow-md shadow-amber-600/15 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between text-white min-h-[160px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Clock className="w-3.5 h-3.5" />
                <span>In Progress</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                38 Field Squads
              </span>
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
              {counts.inProgress.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-white/15 text-[11px] text-white/80 flex items-center justify-between">
            <span>Average Remediation</span>
            <span className="font-semibold text-white">3.2 days</span>
          </div>
        </div>

        {/* Card 4: Vibrant Red - Needs Verification / Urgent */}
        <div
          onClick={() => onNavigateToWorkflow('verification')}
          className="bg-[#D60E00] hover:bg-[#B50C00] p-6 rounded-2xl shadow-md shadow-red-600/15 transition-all hover:scale-[1.02] cursor-pointer flex flex-col justify-between text-white min-h-[160px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Needs Verification</span>
              </span>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs animate-pulse">
                18 new today
              </span>
            </div>
            <div className="text-4xl font-extrabold font-mono tracking-tight tabular-nums">
              {counts.awaitingVerification.toLocaleString()}
            </div>
          </div>
          <div className="pt-3 border-t border-white/15 text-[11px] text-white/80 flex items-center justify-between">
            <span>Queue Triage</span>
            <span className="font-semibold text-white">Avg wait: 35m</span>
          </div>
        </div>
      </div>

      {/* Additional Quick Queues Strip */}
      <div className="flex items-center justify-between text-xs bg-white border border-[#D5DCE5] rounded-xl px-4 py-2.5 text-slate-600 shadow-xs flex-wrap gap-2">
        <span className="font-bold text-[#0B1370]">Active Workflow Pipelines:</span>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => onNavigateToWorkflow('assign')}
            className="hover:text-[#0018FF] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#0018FF]" />
            <span>To Assign: <strong className="font-mono text-slate-900">{counts.toAssign}</strong></span>
          </button>
          <button
            onClick={() => onNavigateToWorkflow('rejected')}
            className="hover:text-[#D60E00] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#D60E00]" />
            <span>Rejected: <strong className="font-mono text-slate-900">{counts.rejected}</strong></span>
          </button>
          <button
            onClick={() => onNavigateToWorkflow('archived')}
            className="hover:text-slate-800 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Archived: <strong className="font-mono text-slate-900">{counts.archived}</strong></span>
          </button>
        </div>
      </div>

      {/* Middle Row: Map Preview & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview Card */}
        <div
          onClick={onOpenMap}
          className="lg:col-span-2 bg-[#E2E8F0]/40 rounded-xl border border-slate-200 overflow-hidden relative group cursor-pointer h-72 flex flex-col justify-center items-center text-center p-6 hover:bg-[#E2E8F0]/60 transition-colors"
        >
          {/* Stylized vector map lines background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="50" x2="100%" y2="80" stroke="#0B1238" strokeWidth="8" />
              <line x1="20%" y1="0" x2="40%" y2="100%" stroke="#0B1238" strokeWidth="6" />
              <line x1="70%" y1="0" x2="60%" y2="100%" stroke="#0B1238" strokeWidth="6" />
              <line x1="0" y1="200" x2="100%" y2="180" stroke="#3B82F6" strokeWidth="12" />
            </svg>
          </div>

          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-[#0B1238]">
              <MapPin className="w-6 h-6 text-blue-700" />
            </div>
            <div className="text-sm font-medium text-slate-600">
              Map preview · Category / Status / Area filters
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:underline">
              <span>Open Interactive Incident Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Needs Attention Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">Needs attention</h3>

            <div className="space-y-3.5 text-sm">
              <div
                onClick={() => onNavigateToWorkflow('verification')}
                className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-0.5"
              >
                <span>Awaiting verification</span>
                <span className="font-bold text-slate-900 font-mono">
                  {counts.awaitingVerification}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 py-0.5">
                <span>High or urgent priority</span>
                <span className="font-bold text-[#D60E00] font-mono">5</span>
              </div>

              <div
                onClick={() => onNavigateToWorkflow('assign')}
                className="flex items-center justify-between text-slate-700 hover:text-slate-900 cursor-pointer py-0.5"
              >
                <span>Verified, not yet assigned</span>
                <span className="font-bold text-slate-900 font-mono">
                  {counts.toAssign}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 py-0.5">
                <span>No update in 7+ days</span>
                <span className="font-bold text-slate-900 font-mono">3</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToWorkflow('verification')}
            className="w-full mt-6 h-11 px-4 bg-[#D60E00] hover:bg-red-700 text-white font-bold text-[13px] tracking-wider uppercase rounded-lg transition-colors shadow-sm inline-flex items-center justify-center cursor-pointer"
          >
            VERIFY PENDING
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0B1370]">Recent reports</h3>
          <button
            onClick={() => onNavigateToWorkflow('reports')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Report ID</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentReports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => onOpenReport(report.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-6 font-bold text-blue-600 font-mono">
                    {report.id}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">
                    {report.category}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {report.locationName}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={report.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-6 text-slate-700">
                    {report.priority}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {report.department || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 text-xs">
                    {report.updatedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
