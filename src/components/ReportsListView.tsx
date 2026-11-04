import React, { useState } from 'react';
import { useReportStore } from '../store';
import { StatusBadge } from './StatusBadge';
import { ViewTab } from '../types';
import { Image as ImageIcon } from 'lucide-react';

interface ReportsListViewProps {
  onOpenReport: (id: string, fromTab: ViewTab) => void;
}

export const ReportsListView: React.FC<ReportsListViewProps> = ({ onOpenReport }) => {
  const { reports, counts } = useReportStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter
  const filtered = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.locationName.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedReports = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B1370] tracking-tight">Reports</h1>
      </div>

      {/* Search & Sort Controls Bar matching wireframe */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search reports"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Report ID</th>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">SLA / Aging</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Submitted</th>
                <th className="py-3 px-6">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    No reports match the current criteria.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => onOpenReport(report.id, 'reports')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-bold text-[#0018FF] font-mono">
                      {report.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-9 h-9 rounded bg-slate-200 flex items-center justify-center overflow-hidden">
                        {report.photoUrl ? (
                          <img
                            src={report.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-800">
                      {report.category}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] border font-medium ${
                          report.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : report.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                            : report.priority === 'High'
                            ? 'bg-amber-50 text-amber-900 border-amber-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {report.status === 'RESOLVED'
                          ? 'SLA: Met'
                          : report.priority === 'Critical'
                          ? 'SLA: 2h left'
                          : report.priority === 'High'
                          ? 'SLA: 14h left'
                          : 'SLA: On track'}
                      </span>
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
                      {report.submittedDate}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 text-xs">
                      {report.updatedDate}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer matching wireframe: Showing 1-5 of [n] */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <div>
          Showing {Math.min(1, filtered.length)}–
          {Math.min(filtered.length, currentPage * pageSize)} of{' '}
          {counts.total > filtered.length ? counts.total.toLocaleString() : filtered.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500"
          >
            ◄ Prev
          </button>
          <span>·</span>
          {[...Array(totalPages)].slice(0, 5).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-1.5 py-0.5 rounded ${
                currentPage === i + 1
                  ? 'font-bold text-slate-900 bg-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <span>·</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500"
          >
            Next ►
          </button>
        </div>
      </div>
    </div>
  );
};
