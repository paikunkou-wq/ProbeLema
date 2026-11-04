import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useReportStore } from '../store';
import { StatusBadge } from './StatusBadge';
import { ViewTab, ReportItem, Priority } from '../types';
import {
  Image as ImageIcon,
  LayoutList,
  Columns2,
  CheckSquare,
  Square,
  AlertTriangle,
  Clock,
  ShieldCheck,
  XCircle,
  UserCheck,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

interface WorkflowListViewProps {
  stage: 'verification' | 'assign' | 'in-progress' | 'resolved' | 'rejected';
  onOpenReport: (id: string, fromTab: ViewTab) => void;
}

// SLA Calculation helper
function getSlaInfo(report: ReportItem): { label: string; colorClass: string; iconType: 'urgent' | 'warning' | 'normal' | 'done' } {
  if (report.status === 'RESOLVED') {
    return {
      label: 'SLA: Met (18h)',
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconType: 'done',
    };
  }
  if (report.status === 'REJECTED') {
    return {
      label: 'Closed',
      colorClass: 'bg-slate-100 text-slate-600 border-slate-200',
      iconType: 'normal',
    };
  }
  if (report.priority === 'Critical') {
    return {
      label: 'SLA: 2h left',
      colorClass: 'bg-rose-50 text-rose-800 border-rose-200 font-bold animate-pulse',
      iconType: 'urgent',
    };
  }
  if (report.priority === 'High') {
    return {
      label: 'SLA: 14h left',
      colorClass: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      iconType: 'warning',
    };
  }
  if (report.priority === 'Medium') {
    return {
      label: 'SLA: 36h left',
      colorClass: 'bg-blue-50 text-[#0018FF] border-blue-200',
      iconType: 'normal',
    };
  }
  if (report.status === 'SUBMITTED' || report.status === 'UNDER_VERIFICATION') {
    return {
      label: 'Age: 4h',
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
      iconType: 'normal',
    };
  }
  return {
    label: 'SLA: 48h left',
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    iconType: 'normal',
  };
}

export const WorkflowListView: React.FC<WorkflowListViewProps> = ({
  stage,
  onOpenReport,
}) => {
  const { reports, counts, actions } = useReportStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [inProgressSubTab, setInProgressSubTab] = useState<'all' | 'assigned_not_started'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'split'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Multi-select batch state
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [showBatchRejectModal, setShowBatchRejectModal] = useState(false);
  const [showBatchAssignModal, setShowBatchAssignModal] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState('Duplicate Report');
  const [batchRejectExplanation, setBatchRejectExplanation] = useState('');
  const [batchAssignDept, setBatchAssignDept] = useState('Public Works');
  const [batchAssignTeam, setBatchAssignTeam] = useState('Alpha Quick-Response Squad');
  const [batchAssignPriority, setBatchAssignPriority] = useState<Priority>('High');
  const [batchAssignDueDate, setBatchAssignDueDate] = useState('Within 24 hours');

  // Selected report for split view map focus
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null);

  // Map refs for split mode
  const splitMapContainerRef = useRef<HTMLDivElement>(null);
  const splitMapInstanceRef = useRef<L.Map | null>(null);
  const splitMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter reports by stage
  let stageReports = reports.filter((r) => {
    switch (stage) {
      case 'verification':
        return r.status === 'SUBMITTED' || r.status === 'UNDER_VERIFICATION';
      case 'assign':
        return r.status === 'VERIFIED';
      case 'in-progress':
        if (inProgressSubTab === 'assigned_not_started') {
          return r.status === 'ASSIGNED';
        }
        return r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS';
      case 'resolved':
        return r.status === 'RESOLVED';
      case 'rejected':
        return r.status === 'REJECTED';
      default:
        return false;
    }
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    stageReports = stageReports.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.locationName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  const paginatedReports = stageReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Default focus in split mode
  useEffect(() => {
    if (stageReports.length > 0 && !focusedReportId) {
      setFocusedReportId(stageReports[0].id);
    }
  }, [stageReports, focusedReportId]);

  // Leaflet map setup for Split Mode
  useEffect(() => {
    if (viewMode !== 'split' || !splitMapContainerRef.current) {
      if (splitMapInstanceRef.current) {
        splitMapInstanceRef.current.remove();
        splitMapInstanceRef.current = null;
        splitMarkersLayerRef.current = null;
      }
      return;
    }

    if (!splitMapInstanceRef.current) {
      const map = L.map(splitMapContainerRef.current, {
        center: [10.3165, 123.8860],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      splitMapInstanceRef.current = map;
      splitMarkersLayerRef.current = markersLayer;
    }

    // Refresh markers
    const map = splitMapInstanceRef.current;
    const markersLayer = splitMarkersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);

    stageReports.forEach((report) => {
      const isFocused = report.id === focusedReportId;
      const { lat, lng } = report.coordinates;
      bounds.extend([lat, lng]);

      // Pin Color according to urgency / status
      let pinColor = '#0018FF'; // Default Blue
      if (report.priority === 'Critical') pinColor = '#D60E00';
      else if (report.status === 'VERIFIED') pinColor = '#FFCD13';
      else if (report.status === 'IN_PROGRESS') pinColor = '#F59E0B';
      else if (report.status === 'RESOLVED') pinColor = '#10B981';

      const pinHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s ease;">
          <div style="
            width: ${isFocused ? '38px' : '28px'};
            height: ${isFocused ? '38px' : '28px'};
            background-color: ${pinColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid ${isFocused ? '#FFFFFF' : '#FFFFFF'};
          ">
            <div style="
              width: ${isFocused ? '14px' : '10px'};
              height: ${isFocused ? '14px' : '10px'};
              background-color: ${pinColor === '#FFCD13' ? '#0B1370' : '#FFFFFF'};
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
          ${
            isFocused
              ? `<div style="
                  position: absolute;
                  top: -8px;
                  left: -8px;
                  right: -8px;
                  bottom: -8px;
                  border: 2px solid #0018FF;
                  border-radius: 50%;
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'split-custom-pin',
        html: pinHtml,
        iconSize: [isFocused ? 38 : 28, isFocused ? 38 : 28],
        iconAnchor: [isFocused ? 19 : 14, isFocused ? 38 : 28],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersLayer);

      marker.on('click', () => {
        setFocusedReportId(report.id);
        map.panTo([lat, lng]);
      });
    });

    if (focusedReportId) {
      const focusedReport = stageReports.find((r) => r.id === focusedReportId);
      if (focusedReport) {
        map.panTo([focusedReport.coordinates.lat, focusedReport.coordinates.lng], { animate: true });
      }
    } else if (stageReports.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [viewMode, stageReports, focusedReportId]);

  // Metadata for headers
  const getHeaderInfo = () => {
    switch (stage) {
      case 'verification':
        return {
          title: 'Verification',
          subtitle: 'Review the evidence, then verify or reject. Verified reports move to Assign.',
          count: counts.awaitingVerification,
          actionLabel: 'REVIEW',
          allowBatch: true,
        };
      case 'assign':
        return {
          title: 'Assign',
          subtitle: 'Verified reports waiting to be assigned to a department, team or official.',
          count: counts.toAssign,
          actionLabel: 'ASSIGN',
          allowBatch: true,
        };
      case 'in-progress':
        return {
          title: 'In Progress',
          subtitle: 'Assigned and active work. Record updates relayed by the department, then resolve.',
          count: counts.inProgress,
          actionLabel: 'VIEW',
          allowBatch: false,
        };
      case 'resolved':
        return {
          title: 'Resolved',
          subtitle: 'Resolved, not yet archived. Archive a report to close its record.',
          count: counts.resolved,
          actionLabel: 'VIEW',
          allowBatch: false,
        };
      case 'rejected':
        return {
          title: 'Rejected',
          subtitle: 'Closed with a formal reason. Rejected reports stay stored and are never deleted.',
          count: counts.rejected,
          actionLabel: 'VIEW',
          allowBatch: false,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Multi-select handlers
  const handleToggleSelectAll = () => {
    const currentPageIds = paginatedReports.map((r) => r.id);
    const allSelected = currentPageIds.every((id) => selectedReportIds.includes(id));
    if (allSelected) {
      setSelectedReportIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedReportIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchVerifyConfirm = () => {
    if (selectedReportIds.length === 0) return;
    actions.batchVerify(selectedReportIds);
    setSelectedReportIds([]);
  };

  const handleBatchRejectConfirm = () => {
    if (selectedReportIds.length === 0) return;
    actions.batchReject(selectedReportIds, batchRejectReason, batchRejectExplanation);
    setShowBatchRejectModal(false);
    setSelectedReportIds([]);
  };

  const handleBatchAssignConfirm = () => {
    if (selectedReportIds.length === 0) return;
    actions.batchAssign(selectedReportIds, {
      department: batchAssignDept,
      assignedTeam: batchAssignTeam,
      priority: batchAssignPriority,
      dueDate: batchAssignDueDate,
    });
    setShowBatchAssignModal(false);
    setSelectedReportIds([]);
  };

  const isAllCurrentPageSelected =
    paginatedReports.length > 0 &&
    paginatedReports.every((r) => selectedReportIds.includes(r.id));

  const focusedReport = stageReports.find((r) => r.id === focusedReportId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none relative pb-28">
      {/* Title & Count Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0B1370] tracking-tight">
              {headerInfo.title}
            </h1>
            {headerInfo.allowBatch && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0018FF] border border-blue-200">
                Batch Mode Ready
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">{headerInfo.subtitle}</p>
        </div>

        <div className="flex items-center gap-6">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#0B1370] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-[#0018FF] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split Dispatch</span>
            </button>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold text-[#0B1370] font-mono tabular-nums">
              {headerInfo.count}
            </span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">reports</span>
          </div>
        </div>
      </div>

      {/* In Progress Segmented Tabs */}
      {stage === 'in-progress' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInProgressSubTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              inProgressSubTab === 'all'
                ? 'bg-[#FFCD13] text-[#0B1370] shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            All · {counts.inProgress}
          </button>
          <button
            onClick={() => setInProgressSubTab('assigned_not_started')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              inProgressSubTab === 'assigned_not_started'
                ? 'bg-[#FFCD13] text-[#0B1370] shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Assigned, not started · 167
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search this list by ID, Category, Location, or Keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-4 py-2.5 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0018FF] focus:border-[#0018FF] placeholder:text-slate-400"
          />
        </div>

        <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter ▾</span>
        </button>

        <button className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>Sort: Last updated ▾</span>
        </button>
      </div>

      {/* MAIN VIEW CONTENT: TABLE OR SPLIT DISPATCH */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {headerInfo.allowBatch && (
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={handleToggleSelectAll}
                        className="p-1 hover:text-[#0018FF] text-slate-400 cursor-pointer inline-flex items-center justify-center"
                        title={isAllCurrentPageSelected ? 'Deselect all' : 'Select all'}
                      >
                        {isAllCurrentPageSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#0018FF]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="py-3 px-6">Report ID</th>
                  {(stage === 'verification' || stage === 'assign') && (
                    <th className="py-3 px-4">Photo</th>
                  )}
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">SLA & Urgency</th>
                  {stage === 'verification' && <th className="py-3 px-6">Description</th>}
                  <th className="py-3 px-6">Location</th>
                  {stage === 'assign' && <th className="py-3 px-6">Verified on</th>}
                  {stage === 'assign' && <th className="py-3 px-6">Verified by</th>}
                  {stage === 'in-progress' && <th className="py-3 px-6">Department</th>}
                  {stage === 'in-progress' && <th className="py-3 px-6">Status</th>}
                  {stage === 'resolved' && <th className="py-3 px-6">Department</th>}
                  {stage === 'resolved' && <th className="py-3 px-6">Resolved on</th>}
                  {stage === 'resolved' && <th className="py-3 px-6">Resolution</th>}
                  {stage === 'rejected' && <th className="py-3 px-6">Reason category</th>}
                  {stage === 'rejected' && <th className="py-3 px-6">Rejected on</th>}
                  {stage === 'rejected' && <th className="py-3 px-6">Rejected by</th>}
                  {stage === 'verification' && <th className="py-3 px-6">Submitted</th>}
                  {stage === 'verification' && <th className="py-3 px-6">Status</th>}
                  {(stage === 'assign' || stage === 'in-progress') && (
                    <th className="py-3 px-6">Priority</th>
                  )}
                  {stage === 'in-progress' && <th className="py-3 px-6">Last update</th>}
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 text-sm">
                      No reports found in this queue.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => {
                    const isSelected = selectedReportIds.includes(report.id);
                    const sla = getSlaInfo(report);

                    return (
                      <tr
                        key={report.id}
                        className={`hover:bg-slate-50/90 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => onOpenReport(report.id, stage)}
                      >
                        {headerInfo.allowBatch && (
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => handleToggleSelectOne(report.id, e)}
                              className="p-1 text-slate-400 hover:text-[#0018FF] cursor-pointer inline-flex items-center justify-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#0018FF]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        )}

                        <td className="py-3.5 px-6 font-bold text-[#0018FF] font-mono">
                          {report.id}
                        </td>

                        {(stage === 'verification' || stage === 'assign') && (
                          <td className="py-3.5 px-4">
                            <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200">
                              {report.photoUrl ? (
                                <img
                                  src={report.photoUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </td>
                        )}

                        <td className="py-3.5 px-6 font-medium text-slate-800">
                          {report.category}
                        </td>

                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] border ${sla.colorClass}`}
                          >
                            {sla.iconType === 'urgent' && <AlertTriangle className="w-3 h-3" />}
                            {sla.iconType === 'warning' && <Clock className="w-3 h-3" />}
                            {sla.iconType === 'done' && <ShieldCheck className="w-3 h-3" />}
                            <span>{sla.label}</span>
                          </span>
                        </td>

                        {stage === 'verification' && (
                          <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">
                            {report.description}
                          </td>
                        )}

                        <td className="py-3.5 px-6 text-slate-600">
                          {report.locationName}
                        </td>

                        {stage === 'assign' && (
                          <td className="py-3.5 px-6 text-slate-600">
                            {report.verifiedOn || 'Aug 27'}
                          </td>
                        )}
                        {stage === 'assign' && (
                          <td className="py-3.5 px-6 font-mono text-xs text-slate-700">
                            {report.verifiedBy || 'GOV-00231'}
                          </td>
                        )}

                        {stage === 'in-progress' && (
                          <td className="py-3.5 px-6 text-slate-700 font-medium">
                            {report.department || 'Environment'}
                          </td>
                        )}
                        {stage === 'in-progress' && (
                          <td className="py-3.5 px-6">
                            <StatusBadge status={report.status} size="sm" />
                          </td>
                        )}

                        {stage === 'resolved' && (
                          <td className="py-3.5 px-6 text-slate-700 font-medium">
                            {report.department || 'Public Works'}
                          </td>
                        )}
                        {stage === 'resolved' && (
                          <td className="py-3.5 px-6 text-slate-600">
                            {report.resolvedDate || 'Aug 29'}
                          </td>
                        )}
                        {stage === 'resolved' && (
                          <td className="py-3.5 px-6 text-slate-700">
                            {report.resolutionSummary || 'Completed'}
                          </td>
                        )}

                        {stage === 'rejected' && (
                          <td className="py-3.5 px-6 font-medium text-slate-800">
                            {report.rejectionReason || 'Duplicate Report'}
                          </td>
                        )}
                        {stage === 'rejected' && (
                          <td className="py-3.5 px-6 text-slate-600">
                            {report.rejectedOn || 'Aug 28'}
                          </td>
                        )}
                        {stage === 'rejected' && (
                          <td className="py-3.5 px-6 font-mono text-xs text-slate-700">
                            {report.rejectedBy || 'GOV-00231'}
                          </td>
                        )}

                        {stage === 'verification' && (
                          <td className="py-3.5 px-6 text-slate-600 text-xs">
                            {report.submittedDate.split(' ')[0]} {report.submittedDate.split(' ')[1]}
                          </td>
                        )}
                        {stage === 'verification' && (
                          <td className="py-3.5 px-6">
                            <StatusBadge status={report.status} size="sm" />
                          </td>
                        )}

                        {(stage === 'assign' || stage === 'in-progress') && (
                          <td className="py-3.5 px-6 text-slate-700">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                report.priority === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : report.priority === 'High'
                                  ? 'bg-amber-100 text-amber-900'
                                  : report.priority === 'Medium'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {report.priority}
                            </span>
                          </td>
                        )}

                        {stage === 'in-progress' && (
                          <td className="py-3.5 px-6 text-slate-500 text-xs">
                            {report.updatedDate}
                          </td>
                        )}

                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReport(report.id, stage);
                            }}
                            className="font-bold text-[#0018FF] hover:underline text-xs tracking-wider uppercase cursor-pointer"
                          >
                            {headerInfo.actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SPLIT SCREEN QUEUE + MAP DISPATCH VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
          {/* Left Column: Report Queue Cards */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                {headerInfo.allowBatch && (
                  <button
                    onClick={handleToggleSelectAll}
                    className="p-1 hover:text-[#0018FF] text-slate-400 cursor-pointer inline-flex items-center justify-center"
                  >
                    {isAllCurrentPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#0018FF]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                )}
                <span>Showing {paginatedReports.length} incidents in queue</span>
              </div>
              <span className="text-slate-400">Click to locate on map</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
              {paginatedReports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No reports in this queue.
                </div>
              ) : (
                paginatedReports.map((report) => {
                  const isFocused = report.id === focusedReportId;
                  const isSelected = selectedReportIds.includes(report.id);
                  const sla = getSlaInfo(report);

                  return (
                    <div
                      key={report.id}
                      onClick={() => setFocusedReportId(report.id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isFocused
                          ? 'border-[#0018FF] bg-blue-50/50 shadow-xs ring-1 ring-[#0018FF]'
                          : isSelected
                          ? 'border-blue-200 bg-blue-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {headerInfo.allowBatch && (
                            <button
                              onClick={(e) => handleToggleSelectOne(report.id, e)}
                              className="text-slate-400 hover:text-[#0018FF] cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#0018FF]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <span className="font-mono font-bold text-sm text-[#0018FF]">
                            {report.id}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${sla.colorClass}`}
                        >
                          {sla.label}
                        </span>
                      </div>

                      <div className="mt-2 flex gap-3">
                        <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {report.photoUrl ? (
                            <img
                              src={report.photoUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {report.category}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                            <span>{report.locationName}</span>
                          </p>
                          <div className="mt-1.5 flex items-center justify-between text-[11px]">
                            <StatusBadge status={report.status} size="sm" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenReport(report.id, stage);
                              }}
                              className="text-[#0018FF] font-bold text-[11px] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>{headerInfo.actionLabel}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Embedded Interactive Map */}
          <div className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs relative">
            <div ref={splitMapContainerRef} className="w-full h-full z-0" />

            {/* Float overlay for focused report card */}
            {focusedReport && (
              <div className="absolute top-4 right-4 z-1000 max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#0018FF]">
                      {focusedReport.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                      {focusedReport.category}
                    </h3>
                  </div>
                  <StatusBadge status={focusedReport.status} size="sm" />
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                  {focusedReport.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[140px]">{focusedReport.locationName}</span>
                  </div>
                  <button
                    onClick={() => onOpenReport(focusedReport.id, stage)}
                    className="px-3 py-1.5 bg-[#0018FF] hover:bg-[#0015cc] text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>Open Case</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
        <div>
          Showing {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, stageReports.length)} of {stageReports.length} reports
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="disabled:opacity-40 font-medium hover:text-[#0018FF] cursor-pointer"
          >
            ◄ Prev
          </button>
          <span>·</span>
          <span className="font-bold text-slate-900">{currentPage}</span>
          <span>·</span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * pageSize >= stageReports.length}
            className="disabled:opacity-40 font-medium hover:text-[#0018FF] cursor-pointer"
          >
            Next ►
          </button>
        </div>
      </div>

      {/* FLOATING MULTI-SELECT BATCH ACTION BAR (Storm / Disaster Mode) */}
      {selectedReportIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0B1370] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FFCD13] text-[#0B1370] flex items-center justify-center font-bold text-xs">
              {selectedReportIds.length}
            </div>
            <div className="text-xs">
              <span className="font-bold text-white">
                {selectedReportIds.length} reports selected
              </span>
              <span className="text-blue-200 block text-[11px]">Batch Command Active</span>
            </div>
          </div>

          <div className="h-6 w-px bg-blue-800" />

          <div className="flex items-center gap-2.5">
            {stage === 'verification' && (
              <>
                <button
                  onClick={handleBatchVerifyConfirm}
                  className="px-4 py-2 bg-[#0018FF] hover:bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify All ({selectedReportIds.length})</span>
                </button>

                <button
                  onClick={() => setShowBatchRejectModal(true)}
                  className="px-4 py-2 bg-[#D60E00] hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Batch Reject</span>
                </button>
              </>
            )}

            {stage === 'assign' && (
              <button
                onClick={() => setShowBatchAssignModal(true)}
                className="px-4 py-2 bg-[#0018FF] hover:bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Batch Assign ({selectedReportIds.length})</span>
              </button>
            )}

            <button
              onClick={() => setSelectedReportIds([])}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* BATCH REJECT MODAL */}
      {showBatchRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#D60E00] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1370]">
                  Batch Reject {selectedReportIds.length} Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This will formally reject all selected reports and inform the citizen reporters.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rejection Reason Category
                </label>
                <select
                  value={batchRejectReason}
                  onChange={(e) => setBatchRejectReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                >
                  <option value="Duplicate Report">Duplicate Report</option>
                  <option value="Out of Jurisdiction">Out of Jurisdiction</option>
                  <option value="Insufficient Evidence">Insufficient Evidence</option>
                  <option value="Already Resolved / Inactive">Already Resolved / Inactive</option>
                  <option value="Spam / Inappropriate Content">Spam / Inappropriate Content</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Formal Explanation to Citizens
                </label>
                <textarea
                  rows={3}
                  value={batchRejectExplanation}
                  onChange={(e) => setBatchRejectExplanation(e.target.value)}
                  placeholder="Provide clarification for the citizens regarding this batch rejection..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBatchRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchRejectConfirm}
                className="px-4 py-2 bg-[#D60E00] hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Batch Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH ASSIGN MODAL */}
      {showBatchAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0018FF] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1370]">
                  Batch Assign {selectedReportIds.length} Reports
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dispatch all selected reports to a single municipal department and squad at once.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Responsible Department
                </label>
                <select
                  value={batchAssignDept}
                  onChange={(e) => setBatchAssignDept(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                >
                  <option value="Public Works">Public Works Department</option>
                  <option value="Environment">Environment & Sanitation</option>
                  <option value="Traffic & Mobility">Traffic & Road Management</option>
                  <option value="Health & Safety">Public Safety & Emergency Squad</option>
                  <option value="Water & Sewage">Water Works & Drainage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assigned Team / Squad
                </label>
                <input
                  type="text"
                  value={batchAssignTeam}
                  onChange={(e) => setBatchAssignTeam(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                  placeholder="e.g. Rapid Asphalt Patching Squad 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Priority Level
                  </label>
                  <select
                    value={batchAssignPriority}
                    onChange={(e) => setBatchAssignPriority(e.target.value as Priority)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                  >
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="High">High (Within 24h)</option>
                    <option value="Medium">Medium (Within 48h)</option>
                    <option value="Low">Low (Within 7d)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target SLA Due Date
                  </label>
                  <select
                    value={batchAssignDueDate}
                    onChange={(e) => setBatchAssignDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0018FF]"
                  >
                    <option value="Within 12 hours">Within 12 hours</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                    <option value="Within 48 hours">Within 48 hours</option>
                    <option value="End of current week">End of current week</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBatchAssignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchAssignConfirm}
                className="px-4 py-2 bg-[#0018FF] hover:bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Batch Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
