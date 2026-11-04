import React, { useState } from 'react';
import { useReportStore } from '../store';
import { StatusBadge } from './StatusBadge';
import { ViewTab } from '../types';

interface ArchivedListViewProps {
  onOpenReport: (id: string, fromTab: ViewTab) => void;
}

export const ArchivedListView: React.FC<ArchivedListViewProps> = ({ onOpenReport }) => {
  const { reports, counts } = useReportStore();
  const [searchQuery, setSearchQuery] = useState('');

  const archivedReports = reports.filter((r) => r.status === 'ARCHIVED');

  const filtered = archivedReports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.locationName.toLowerCase().includes(q) ||
      (r.resolutionSummary && r.resolutionSummary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Title & Count Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1370] tracking-tight">
            Archived records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical record of completed cases.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-[#0B1370] font-mono tabular-nums">
            {counts.archived}
          </span>
          <span className="text-xs text-slate-500 ml-1.5 font-medium">reports</span>
        </div>
      </div>

      {/* Closed records banner matching wireframe */}
      <div className="bg-[#E3E7FF]/40 border border-[#0018FF]/20 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
        <span className="font-bold text-[#0B1370]">Closed records.</span> A report is
        archived from Resolved when its case is complete. Archived reports leave all
        active lists and the map, stay read-only and are never deleted.
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search this list"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-slate-400"
          />
        </div>

        <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0">
          <span>Filter ▾</span>
        </button>

        <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0">
          <span>Sort: Last updated ▾</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Report ID</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Resolution</th>
                <th className="py-3 px-6">Resolved on</th>
                <th className="py-3 px-6">Archived on</th>
                <th className="py-3 px-6">Archived by</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No archived records found.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => onOpenReport(report.id, 'archived')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-[#0018FF] font-mono">
                      {report.id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {report.category}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {report.locationName}
                    </td>
                    <td className="py-3.5 px-6 text-slate-700">
                      {report.resolutionSummary || 'Completed'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {report.resolvedDate || 'Aug 20'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {report.archivedOn || 'Sep 30'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-slate-700">
                      {report.archivedBy || 'GOV-00231'}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status="ARCHIVED" size="sm" />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReport(report.id, 'archived');
                        }}
                        className="font-bold text-[#0018FF] hover:underline text-xs tracking-wider uppercase cursor-pointer"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <div>Showing 1–{Math.min(filtered.length, 10)} of [n]</div>
        <div className="flex items-center gap-2">
          <span>◄ Prev</span>
          <span>·</span>
          <span className="font-bold text-slate-900">1</span>
          <span>·</span>
          <span>2</span>
          <span>·</span>
          <span>3</span>
          <span>·</span>
          <span>Next ►</span>
        </div>
      </div>
    </div>
  );
};
