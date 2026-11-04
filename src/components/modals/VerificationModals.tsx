import React, { useState } from 'react';
import { ReportItem } from '../../types';
import { Image as ImageIcon } from 'lucide-react';

interface ConfirmVerificationModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmVerificationModal: React.FC<ConfirmVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div>
          <h2 className="text-lg font-bold text-[#0B1370]">Confirm verification</h2>
          <p className="text-[13px] text-[#4B5563] mt-1.5 leading-relaxed">
            Status becomes VERIFIED. It then appears in Assign.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="h-11 px-4 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider border-2 border-[#0018FF] text-[#0018FF] hover:bg-[#0018FF]/5 transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="h-11 px-5 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider bg-[#0018FF] text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            CONFIRM VERIFICATION
          </button>
        </div>
      </div>
    </div>
  );
};

interface RejectReportModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, explanation: string) => void;
}

export const RejectReportModal: React.FC<RejectReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState('Duplicate Report');
  const [explanation, setExplanation] = useState('');
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);

  if (!isOpen) return null;

  const reasons = [
    'Duplicate Report',
    'False/Invalid Report',
    'Incorrect Location',
    'Insufficient Evidence',
    'Issue Already Resolved',
    'Outside Government Jurisdiction',
    'Inappropriate/Prohibited Content',
    'Other (explanation required)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      alert('Formal explanation is required to reject a report.');
      return;
    }
    onConfirm(selectedReason, explanation);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#0B1370]">Reject Report</h2>

        {/* Report Preview Header Box */}
        <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {report.photoUrl ? (
              <img src={report.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="text-xs">
            <div className="font-bold text-slate-900 font-mono">
              {report.id} · <span className="font-sans">{report.category}</span>
            </div>
            <div className="text-slate-500 mt-0.5">
              {report.locationName} · {report.submittedDate}
            </div>
          </div>
        </div>

        {/* Radio reason selection (2 columns) matching wireframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-xs text-slate-800">
          {reasons.map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="reject-reason"
                value={r}
                checked={selectedReason === r}
                onChange={() => setSelectedReason(r)}
                className="text-blue-700 focus:ring-blue-600"
              />
              <span className="font-medium">{r}</span>
            </label>
          ))}
        </div>

        {/* Formal Explanation Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Formal explanation (required)
          </label>
          <textarea
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Already reported as PL-2026-001180. The citizen was notified."
            className="w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            required
          />
        </div>

        {/* Attach supporting document (optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Attach supporting document (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer shadow-sm">
              <span>Choose file</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachedDocName(e.target.files[0].name);
                  }
                }}
              />
            </label>
            <span className="text-xs text-slate-500">
              {attachedDocName || 'No file chosen'}
            </span>
          </div>
        </div>

        {/* Non-destructive guarantee callout box matching wireframe */}
        <div className="p-3.5 border border-red-200 bg-red-50/60 rounded-xl text-xs text-[#D60E00] leading-relaxed font-medium">
          Rejected reports remain stored and cannot be deleted. The citizen is
          notified with the reason, and the rejection is added to the timeline.
        </div>

        {/* Buttons matching Foundations tokens */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider border-2 border-[#0018FF] text-[#0018FF] hover:bg-[#0018FF]/5 transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-11 px-5 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider bg-[#D60E00] text-white hover:bg-red-700 rounded-lg transition-colors uppercase tracking-wider shadow-sm cursor-pointer"
          >
            CONFIRM REJECTION
          </button>
        </div>
      </div>
    </div>
  );
};
