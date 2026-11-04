import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useReportStore } from '../store';
import { ReportItem, ReportStatus, ReportCategory, Priority, ViewTab } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, X, ArrowUp, Check, User, Clock, Plus, Minus } from 'lucide-react';

interface MapViewProps {
  onOpenReport: (id: string, fromTab?: ViewTab) => void;
  onOpenWorkflow: (tab: ViewTab) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onOpenReport, onOpenWorkflow }) => {
  const { reports } = useReportStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // Active filters
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    SUBMITTED: true,
    UNDER_VERIFICATION: true,
    VERIFIED: true,
    ASSIGNED: true,
    IN_PROGRESS: true,
    RESOLVED: true,
    REJECTED: false,
    ARCHIVED: false,
  });

  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({
    'Garbage/Waste': true,
    'Road Damage': true,
    'Flooding': true,
    'Drainage': true,
    'Streetlight': true,
    'Pollution': true,
    'Public Facility': true,
    'Illegal Dumping': true,
    'Other': true,
  });

  const [priorityFilters, setPriorityFilters] = useState<Record<string, boolean>>({
    Low: true,
    Medium: true,
    High: true,
    Critical: true,
  });

  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 days');

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // Status
    if (!statusFilters[report.status]) return false;

    // Category
    if (!categoryFilters[report.category]) return false;

    // Priority
    if (report.priority !== 'Not set' && !priorityFilters[report.priority]) {
      return false;
    }

    // Department
    if (departmentFilter !== 'All' && report.department !== departmentFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = report.id.toLowerCase().includes(q);
      const matchLoc = report.locationName.toLowerCase().includes(q);
      const matchCat = report.category.toLowerCase().includes(q);
      const matchDesc = report.description.toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchCat && !matchDesc) return false;
    }

    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around metropolitan civic area (10.3157, 123.8854)
    const map = L.map(mapContainerRef.current, {
      center: [10.3165, 123.8860],
      zoom: 15,
      zoomControl: false,
    });

    // Clean modern vector tile layer matching wireframe's soft aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; CartoDB & OpenStreetMap',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when reports or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    filteredReports.forEach((report) => {
      // Choose pin color and icon matching Foundations specification
      let pinColor = '#0018FF'; // Default Blue
      let iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';

      if (report.status === 'IN_PROGRESS') {
        pinColor = '#B45309';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3"></path></svg>';
      } else if (report.status === 'RESOLVED') {
        pinColor = '#166534';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6"></path></svg>';
      } else if (report.status === 'REJECTED') {
        pinColor = '#D60E00';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>';
      } else if (report.status === 'ASSIGNED') {
        pinColor = '#0018FF';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4 4-6 8-6s8 2 8 6"></path></svg>';
      } else if (report.status === 'VERIFIED') {
        pinColor = '#0F766E';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"></path></svg>';
      } else if (report.status === 'SUBMITTED') {
        pinColor = '#475569';
        iconSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
      }

      const isSelected = selectedReport?.id === report.id;

      const customIcon = L.divIcon({
        className: 'custom-probe-pin',
        html: `
          <div style="position: relative; width: 34px; height: 34px;">
            <div class="pin-bubble" style="
              width: 34px;
              height: 34px;
              background-color: ${pinColor};
              ${isSelected ? 'border-color: #FFCD13; box-shadow: 0 0 0 3px #0018FF; transform: rotate(-45deg) scale(1.25);' : ''}
            ">
              <div class="pin-icon">
                ${iconSvg}
              </div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([report.coordinates.lat, report.coordinates.lng], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setSelectedReport(report);
      });

      marker.addTo(markersLayerRef.current!);
    });

    // Add cluster marker as specified in Foundations (40px, Deep Blue #0B1370, 3px white border, count)
    const clusterIcon = L.divIcon({
      className: 'custom-probe-pin',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background-color: #0B1370;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          border: 3px solid #ffffff;
        ">
          9
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([10.3210, 123.8995], { icon: clusterIcon }).addTo(markersLayerRef.current);
  }, [filteredReports, selectedReport]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const clearAllFilters = () => {
    setStatusFilters({
      SUBMITTED: true,
      UNDER_VERIFICATION: true,
      VERIFIED: true,
      ASSIGNED: true,
      IN_PROGRESS: true,
      RESOLVED: true,
      REJECTED: true,
      ARCHIVED: true,
    });
    setCategoryFilters({
      'Garbage/Waste': true,
      'Road Damage': true,
      'Flooding': true,
      'Drainage': true,
      'Streetlight': true,
      'Pollution': true,
      'Public Facility': true,
      'Illegal Dumping': true,
      'Other': true,
    });
    setPriorityFilters({
      Low: true,
      Medium: true,
      High: true,
      Critical: true,
    });
    setDepartmentFilter('All');
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden select-none">
      {/* Top Filter Floating Bar */}
      <div className="absolute top-4 left-6 right-6 z-[1000] flex items-center gap-3 max-w-4xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search ID or place"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder:text-slate-400 pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Status ▾</span>
        </button>

        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Category ▾</span>
        </button>

        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Department ▾</span>
        </button>

        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Date ▾</span>
        </button>
      </div>

      {/* Main Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Status Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-5 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <ArrowUp className="w-3.5 h-3.5 text-slate-800" strokeWidth={2.5} />
          <span>Submitted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-teal-600" strokeWidth={2.5} />
          <span>Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
          <span>Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
          <span>Resolved</span>
        </div>
      </div>

      {/* Bottom Right Zoom Controls */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center font-bold text-lg"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center font-bold text-lg"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Slide-over Filters Drawer (Government___Map___Filters_panel_2x_8a9c4bc4.png) */}
      {isFilterPanelOpen && (
        <div className="absolute top-0 right-0 bottom-0 w-96 bg-white z-[1100] shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Map filters</h2>
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STATUS Section */}
            <div>
              <div className="text-[11px] font-bold text-blue-900 tracking-wider uppercase mb-3">
                STATUS
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-slate-700">
                {[
                  ['SUBMITTED', 'Submitted'],
                  ['UNDER_VERIFICATION', 'Under Verification'],
                  ['VERIFIED', 'Verified'],
                  ['ASSIGNED', 'Assigned'],
                  ['IN_PROGRESS', 'In Progress'],
                  ['RESOLVED', 'Resolved'],
                  ['REJECTED', 'Rejected'],
                  ['ARCHIVED', 'Archived'],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!statusFilters[key]}
                      onChange={(e) =>
                        setStatusFilters({ ...statusFilters, [key]: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* CATEGORY Section */}
            <div>
              <div className="text-[11px] font-bold text-blue-900 tracking-wider uppercase mb-3">
                CATEGORY
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-medium text-slate-700">
                {[
                  'Garbage/Waste',
                  'Road Damage',
                  'Flooding',
                  'Drainage',
                  'Streetlight',
                  'Pollution',
                  'Public Facility',
                  'Illegal Dumping',
                  'Other',
                ].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!categoryFilters[cat]}
                      onChange={(e) =>
                        setCategoryFilters({ ...categoryFilters, [cat]: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PRIORITY Section */}
            <div>
              <div className="text-[11px] font-bold text-blue-900 tracking-wider uppercase mb-3">
                PRIORITY
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!priorityFilters[p]}
                      onChange={(e) =>
                        setPriorityFilters({ ...priorityFilters, [p]: e.target.checked })
                      }
                      className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-3 py-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="All">All</option>
                <option value="Environment">Environment</option>
                <option value="Public Works">Public Works</option>
                <option value="Drainage">Drainage</option>
              </select>
            </div>

            {/* Date Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg px-3 py-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 7 days">Last 7 days</option>
                <option value="Today">Today</option>
                <option value="All time">All time</option>
              </select>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-200 flex items-center gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 py-2.5 px-4 text-sm font-bold text-teal-800 border border-teal-700 rounded-lg hover:bg-teal-50 transition-colors uppercase"
            >
              CLEAR FILTERS
            </button>
            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="flex-1 py-2.5 px-4 text-sm font-bold text-white bg-[#0B1238] rounded-lg hover:bg-[#111A4D] transition-colors uppercase"
            >
              APPLY FILTERS
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Marker Preview Drawer (Government___Map___Marker_preview_2x_485d89c1.png) */}
      {selectedReport && (
        <div className="absolute top-0 right-0 bottom-0 w-96 bg-white z-[1100] shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-start justify-between">
            <div>
              <div className="text-xs font-mono font-semibold text-slate-500">
                {selectedReport.id}
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {selectedReport.category}
              </h2>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Photo Preview Container */}
            <div className="w-full h-44 bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-slate-500 text-xs font-medium">
              {selectedReport.photoUrl ? (
                <img
                  src={selectedReport.photoUrl}
                  alt={selectedReport.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>Report photo</span>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2.5">
              <StatusBadge status={selectedReport.status} size="sm" />
              {selectedReport.priority !== 'Not set' && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Priority: {selectedReport.priority}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {selectedReport.description}
            </p>

            {/* Meta Table */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold text-slate-800 text-right">
                  {selectedReport.locationName}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span className="text-slate-500">Coordinates</span>
                <span className="font-mono text-slate-700">
                  {selectedReport.coordinates.formatted ||
                    `${selectedReport.coordinates.lat.toFixed(4)}, ${selectedReport.coordinates.lng.toFixed(4)}`}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span className="text-slate-500">Submitted</span>
                <span className="text-slate-800">{selectedReport.submittedDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100/60">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">
                  {selectedReport.department || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last update</span>
                <span className="text-slate-700">{selectedReport.updatedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons matching wireframe */}
          <div className="p-5 border-t border-slate-200 space-y-2.5 bg-slate-50/50">
            <button
              onClick={() => onOpenReport(selectedReport.id, 'map')}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#0B1238] rounded-lg hover:bg-[#151D4D] transition-colors uppercase tracking-wider"
            >
              VIEW FULL REPORT
            </button>

            <button
              onClick={() => {
                const stageTab =
                  selectedReport.status === 'SUBMITTED' ||
                  selectedReport.status === 'UNDER_VERIFICATION'
                    ? 'verification'
                    : selectedReport.status === 'VERIFIED'
                    ? 'assign'
                    : selectedReport.status === 'RESOLVED'
                    ? 'resolved'
                    : selectedReport.status === 'REJECTED'
                    ? 'rejected'
                    : selectedReport.status === 'ARCHIVED'
                    ? 'archived'
                    : 'in-progress';
                onOpenWorkflow(stageTab);
                onOpenReport(selectedReport.id, stageTab);
              }}
              className="w-full py-2.5 text-xs font-bold text-teal-800 border border-teal-700 bg-white rounded-lg hover:bg-teal-50 transition-colors uppercase tracking-wider"
            >
              OPEN IN WORKFLOW · {selectedReport.status.replace('_', ' ')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
