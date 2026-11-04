import React, { useState } from 'react';
import { ReportItem, ViewTab, Priority } from '../types';
import { StatusBadge } from './StatusBadge';
import { useReportStore } from '../store';
import {
  ConfirmVerificationModal,
  RejectReportModal,
} from './modals/VerificationModals';
import {
  AssignReportModal,
  ProgressUpdateModal,
  ResolveReportModal,
  ConfirmArchiveModal,
} from './modals/WorkflowModals';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ArrowLeft, Check, Image as ImageIcon, Sliders, Layers } from 'lucide-react';

interface ReportDetailViewProps {
  report: ReportItem;
  fromTab: ViewTab | null;
  onBack: () => void;
  onNavigateWorkflow: (stageTab: ViewTab) => void;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  report,
  fromTab,
  onBack,
  onNavigateWorkflow,
}) => {
  const { actions } = useReportStore();

  // Modal visibility states
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Active photo tab & evidence display mode
  const [activePhotoTab, setActivePhotoTab] = useState<'before' | 'progress' | 'after'>('before');
  const [evidenceMode, setEvidenceMode] = useState<'slider' | 'tabs'>('slider');

  // Determine source section name
  const sourceLabel =
    fromTab === 'verification'
      ? 'Verification'
      : fromTab === 'assign'
      ? 'Assign'
      : fromTab === 'in-progress'
      ? 'In Progress'
      : fromTab === 'resolved'
      ? 'Resolved'
      : fromTab === 'rejected'
      ? 'Rejected'
      : fromTab === 'archived'
      ? 'Archived'
      : 'Reports';

  const isReadOnlyReportsView = fromTab === 'reports';

  // Render Stepper on top right
  const renderStepper = () => {
    if (report.status === 'REJECTED') {
      return (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Outcome</span>
          <span className="font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            ✕ REJECTED (closed, stored)
          </span>
        </div>
      );
    }

    const stages = [
      { key: 'verification', label: 'Verification', checkStatuses: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'] },
      { key: 'assign', label: 'Assign', checkStatuses: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'] },
      { key: 'in-progress', label: 'In Progress', checkStatuses: ['RESOLVED', 'ARCHIVED'] },
      { key: 'resolved', label: 'Resolved', checkStatuses: ['ARCHIVED'] },
      { key: 'archived', label: 'Archived', checkStatuses: [] },
    ];

    // Current active stage
    const currentStageKey =
      report.status === 'SUBMITTED' || report.status === 'UNDER_VERIFICATION'
        ? 'verification'
        : report.status === 'VERIFIED'
        ? 'assign'
        : report.status === 'ASSIGNED' || report.status === 'IN_PROGRESS'
        ? 'in-progress'
        : report.status === 'RESOLVED'
        ? 'resolved'
        : 'archived';

    return (
      <div className="flex items-center gap-1.5 text-xs select-none">
        <span className="text-slate-500 font-medium mr-1">Stage</span>
        {stages.map((st, idx) => {
          const isPassed = st.checkStatuses.includes(report.status);
          const isCurrent = currentStageKey === st.key;

          return (
            <React.Fragment key={st.key}>
              {idx > 0 && <span className="text-slate-300">›</span>}
              {isPassed ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[#0018FF] bg-blue-50 border border-blue-200 font-bold">
                  <Check className="w-3 h-3 text-[#0018FF] stroke-[3]" />
                  <span>{st.label}</span>
                </span>
              ) : isCurrent ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFCD13] text-[#0B1370] font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1370]" />
                  <span>{st.label}</span>
                </span>
              ) : (
                <span className="px-2 py-1 text-slate-400 font-medium">
                  {st.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Target workflow tab for the "OPEN IN WORKFLOW" action
  const getTargetWorkflowStageTab = (): ViewTab => {
    switch (report.status) {
      case 'SUBMITTED':
      case 'UNDER_VERIFICATION':
        return 'verification';
      case 'VERIFIED':
        return 'assign';
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'RESOLVED':
        return 'resolved';
      case 'REJECTED':
        return 'rejected';
      case 'ARCHIVED':
        return 'archived';
      default:
        return 'reports';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Navigation Row: Back Link & Stage Stepper */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold text-[#0018FF] hover:underline transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {sourceLabel}</span>
        </button>

        <div>{renderStepper()}</div>
      </div>

      {/* Main Title Row with SLA Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0B1370] tracking-tight">
          <span className="font-mono">{report.id}</span> · {report.category}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Municipal SLA Badge */}
          {(report.status === 'SUBMITTED' || report.status === 'UNDER_VERIFICATION') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>SLA: 2h remaining to verify</span>
            </span>
          )}
          {report.status === 'VERIFIED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
              <span>SLA: Assign target 24h</span>
            </span>
          )}
          {report.status === 'IN_PROGRESS' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
              <span>SLA: In Dispatch · Day 2 of 4</span>
            </span>
          )}
          {(report.status === 'RESOLVED' || report.status === 'ARCHIVED') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span>✓ Resolved within SLA (2.1 days)</span>
            </span>
          )}
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Content Grid: Left 2 Cols (Evidence & Info), Right 1 Col (Timeline & Action) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos Container */}
          {report.status === 'RESOLVED' || report.status === 'ARCHIVED' ? (
            <div className="space-y-4">
              {/* Evidence View Mode Switcher */}
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-[#0B1370] uppercase tracking-wider">
                  Visual Evidence & Remediation Proof
                </span>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setEvidenceMode('slider')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      evidenceMode === 'slider'
                        ? 'bg-white text-[#0018FF] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Before / After Slider</span>
                  </button>
                  <button
                    onClick={() => setEvidenceMode('tabs')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      evidenceMode === 'tabs'
                        ? 'bg-white text-[#0018FF] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>3-Phase Gallery</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Interactive Slider */}
              {evidenceMode === 'slider' ? (
                <BeforeAfterSlider
                  beforeUrl={report.beforePhotoUrl || report.photoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'}
                  afterUrl={report.afterPhotoUrl || report.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80'}
                  beforeLabel="BEFORE REMEDIATION"
                  afterLabel="AFTER RESOLUTION"
                />
              ) : (
                /* Mode 2: 3-Phase Tabs */
                <div className="space-y-3">
                  <div className="w-full h-80 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 font-medium relative">
                    {activePhotoTab === 'before' && (report.beforePhotoUrl || report.photoUrl) ? (
                      <img
                        src={report.beforePhotoUrl || report.photoUrl}
                        alt="Before remediation"
                        className="w-full h-full object-cover"
                      />
                    ) : activePhotoTab === 'progress' && (report.progressPhotoUrl || report.photoUrl) ? (
                      <img
                        src={report.progressPhotoUrl || report.photoUrl}
                        alt="Work in progress"
                        className="w-full h-full object-cover"
                      />
                    ) : activePhotoTab === 'after' && (report.afterPhotoUrl || report.photoUrl) ? (
                      <img
                        src={report.afterPhotoUrl || report.photoUrl}
                        alt="After resolution"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>Original photo</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setActivePhotoTab('before')}
                      className={`py-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePhotoTab === 'before'
                          ? 'bg-[#0018FF] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Before Remediation
                    </button>
                    <button
                      onClick={() => setActivePhotoTab('progress')}
                      className={`py-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePhotoTab === 'progress'
                          ? 'bg-[#0018FF] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Work in Progress
                    </button>
                    <button
                      onClick={() => setActivePhotoTab('after')}
                      className={`py-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePhotoTab === 'after'
                          ? 'bg-[#0018FF] text-white shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      Final Resolution
                    </button>
                  </div>
                </div>
              )}

              {/* Resolution Summary Description */}
              <div className="text-xs text-slate-600 pt-1">
                Accumulated garbage was removed from the riverbank. Environment Dept. ·{' '}
                {report.resolvedDate || 'Aug 29, 2026'}.
              </div>
            </div>
          ) : (
            <div className="w-full h-80 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 font-medium relative">
              {report.photoUrl ? (
                <img
                  src={report.photoUrl}
                  alt={report.description}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs font-medium">Original photo</span>
                </div>
              )}
            </div>
          )}

          {/* Rejection Notice Banner if Rejected */}
          {report.status === 'REJECTED' && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-1">
              <div className="text-xs font-bold text-rose-800">
                Rejection reason · {report.rejectionReason || 'Duplicate Report'}
              </div>
              <div className="text-xs text-rose-700 leading-relaxed">
                {report.rejectionExplanation ||
                  'Already reported as PL-2026-001180. The citizen was notified.'}
              </div>
            </div>
          )}

          {/* Incident Description & Coordinates */}
          <div className="space-y-1.5">
            <p className="text-base font-medium text-slate-900">
              {report.description}
            </p>
            <div className="text-xs text-slate-500 font-mono">
              <span className="font-sans font-medium text-slate-700">
                {report.locationName}
              </span>{' '}
              · {report.coordinates.formatted || `${report.coordinates.lat}, ${report.coordinates.lng}`} · Submitted {report.submittedDate}
            </div>
          </div>

          {/* Assignment Box (if Assigned or In Progress) */}
          {(report.status === 'ASSIGNED' ||
            report.status === 'IN_PROGRESS' ||
            report.department) && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5 shadow-xs">
              <div className="text-xs font-bold text-slate-900">Assignment</div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Department:</span>{' '}
                {report.department || 'Environment'} ·{' '}
                <span className="font-semibold text-slate-800">Team:</span>{' '}
                {report.assignedTeam || '[name]'} ·{' '}
                <span className="font-semibold text-slate-800">Priority:</span>{' '}
                {report.priority || 'High'} ·{' '}
                <span className="font-semibold text-slate-800">Due:</span>{' '}
                {report.dueDate || '[date]'}
              </div>
              {report.internalNotes && (
                <div className="text-xs text-slate-500 italic">
                  Notes: {report.internalNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Timeline & Contextual Actions Box */}
        <div className="space-y-6">
          {/* Append-only Timeline matching wireframe */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-5">
              Timeline (append-only)
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-600/30">
              {report.timeline.map((event) => (
                <div key={event.id} className="relative">
                  {/* Timeline Node dot */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#0018FF] ring-4 ring-blue-100" />

                  <div className="text-xs">
                    <div className="font-bold text-[#0B1370]">
                      {event.stageTitle}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {event.actor} · {event.timestamp}
                    </div>
                    {event.details && (
                      <div className="text-slate-600 mt-1 italic text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                        {event.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="text-sm font-bold text-[#0B1370]">Actions</div>

            {/* If viewed from master Reports list, render "OPEN IN WORKFLOW" */}
            {isReadOnlyReportsView ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const targetTab = getTargetWorkflowStageTab();
                    onNavigateWorkflow(targetTab);
                  }}
                  className="w-full h-11 px-4 text-[13px] font-bold text-[#0018FF] border-2 border-[#0018FF] bg-white hover:bg-[#0018FF]/5 rounded-lg transition-colors uppercase tracking-wider cursor-pointer shadow-xs inline-flex items-center justify-center"
                >
                  OPEN IN WORKFLOW · {sourceLabel === 'Reports' ? report.status.replace('_', ' ') : sourceLabel}
                </button>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This page is read-only. Actions are done in the Workflow section.
                </p>
              </div>
            ) : (
              /* Workflow specific actions */
              <div className="space-y-2.5">
                {/* Verification Stage Actions */}
                {(report.status === 'SUBMITTED' ||
                  report.status === 'UNDER_VERIFICATION') && (
                  <>
                    <button
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#0018FF] hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                    >
                      VERIFY REPORT
                    </button>
                    <button
                      onClick={() => setIsRejectModalOpen(true)}
                      className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#D60E00] hover:bg-red-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                    >
                      REJECT REPORT
                    </button>
                  </>
                )}

                {/* Assign Stage Actions */}
                {report.status === 'VERIFIED' && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#0018FF] hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                  >
                    ASSIGN REPORT
                  </button>
                )}

                {/* In Progress Stage Actions */}
                {report.status === 'ASSIGNED' && (
                  <button
                    onClick={() => actions.startAction(report.id)}
                    className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#0018FF] hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                  >
                    START ACTION · MARK IN PROGRESS
                  </button>
                )}

                {report.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => setIsProgressModalOpen(true)}
                      className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#0018FF] hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                    >
                      ADD PROGRESS UPDATE
                    </button>
                    <button
                      onClick={() => setIsResolveModalOpen(true)}
                      className="w-full h-11 px-4 text-[13px] font-bold text-[#0018FF] border-2 border-[#0018FF] bg-white hover:bg-[#0018FF]/5 rounded-lg transition-colors uppercase tracking-wider cursor-pointer shadow-xs inline-flex items-center justify-center"
                    >
                      RESOLVE REPORT
                    </button>
                  </>
                )}

                {/* Resolved Stage Actions */}
                {report.status === 'RESOLVED' && (
                  <button
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="w-full h-11 px-4 text-[13px] font-bold text-white bg-[#0018FF] hover:bg-blue-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center justify-center"
                  >
                    ARCHIVE REPORT
                  </button>
                )}

                {/* Rejected State */}
                {report.status === 'REJECTED' && (
                  <div className="text-xs text-slate-500 leading-relaxed">
                    No further actions. Rejected reports stay stored.
                  </div>
                )}

                {/* Archived State */}
                {report.status === 'ARCHIVED' && (
                  <div className="text-xs text-slate-500 leading-relaxed">
                    Archived records are read-only.
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Reports are never deleted.
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmVerificationModal
        report={report}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onConfirm={() => {
          actions.verifyReport(report.id);
          setIsVerifyModalOpen(false);
        }}
      />

      <RejectReportModal
        report={report}
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={(reason, explanation) => {
          actions.rejectReport(report.id, reason, explanation);
          setIsRejectModalOpen(false);
        }}
      />

      <AssignReportModal
        report={report}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={(data) => {
          actions.assignReport(report.id, data);
          setIsAssignModalOpen(false);
        }}
      />

      <ProgressUpdateModal
        report={report}
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        onConfirm={(data) => {
          actions.addProgressUpdate(report.id, data);
          setIsProgressModalOpen(false);
        }}
      />

      <ResolveReportModal
        report={report}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirm={(data) => {
          actions.resolveReport(report.id, data);
          setIsResolveModalOpen(false);
        }}
      />

      <ConfirmArchiveModal
        report={report}
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={() => {
          actions.archiveReport(report.id);
          setIsArchiveModalOpen(false);
        }}
      />
    </div>
  );
};
