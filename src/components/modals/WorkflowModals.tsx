import React, { useState } from 'react';
import { ReportItem, Priority } from '../../types';
import { Upload } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* ASSIGN REPORT MODAL                                                        */
/* -------------------------------------------------------------------------- */
interface AssignReportModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    department: string;
    assignedTeam: string;
    priority: Priority;
    dueDate?: string;
    internalNotes?: string;
  }) => void;
}

export const AssignReportModal: React.FC<AssignReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [department, setDepartment] = useState(report.department || 'Environment Department');
  const [assignedTeam, setAssignedTeam] = useState('River Cleanup Squad Beta');
  const [priority, setPriority] = useState<Priority>('High');
  const [dueDate, setDueDate] = useState('Sep 02, 2026');
  const [internalNotes, setInternalNotes] = useState('Bring boat and bags. (internal)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      department,
      assignedTeam,
      priority,
      dueDate,
      internalNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-[#0B1370]">Assign Report</h2>
          <p className="text-[13px] text-[#4B5563] mt-1">
            Status becomes ASSIGNED. The report then appears under In Progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Assigned team / official */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Assigned team / official
            </label>
            <select
              value={assignedTeam}
              onChange={(e) => setAssignedTeam(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="River Cleanup Squad Beta">River Cleanup Squad Beta</option>
              <option value="Sanitation Field Unit 1">Sanitation Field Unit 1</option>
              <option value="Road Maintenance Unit 3">Road Maintenance Unit 3</option>
              <option value="Emergency Response Taskforce">Emergency Response Taskforce</option>
              <option value="Electrical Repair Crew A">Electrical Repair Crew A</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Priority</label>
            <div className="flex items-center gap-5 text-xs text-slate-800">
              {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="text-blue-700 focus:ring-blue-600"
                  />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Due date</label>
            <input
              type="text"
              value={dueDate}
              placeholder="[date]"
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Instructions / internal notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Instructions / internal notes
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal dispatch notes..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider border-2 border-[#0018FF] text-[#0018FF] hover:bg-[#0018FF]/5 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider bg-[#0018FF] text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              CONFIRM ASSIGNMENT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* ADD PROGRESS UPDATE MODAL                                                  */
/* -------------------------------------------------------------------------- */
interface ProgressUpdateModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { description: string; photoUrl?: string; timestamp?: string }) => void;
}

export const ProgressUpdateModal: React.FC<ProgressUpdateModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [description, setDescription] = useState('Cleanup team is removing the waste.');
  const [datetime, setDatetime] = useState('Aug 29, 2026 · 10:00 AM');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onConfirm({
      description,
      photoUrl: photoPreview || undefined,
      timestamp: datetime,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-[#0B1370]">Add Progress Update</h2>
          <p className="text-[13px] text-[#4B5563] mt-1">
            Added to the timeline. Earlier events cannot be edited or removed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Progress description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Progress photo
            </label>
            <label className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 text-xs text-slate-500">
              <Upload className="w-4 h-4 mb-1 text-slate-400" />
              <span>{photoPreview ? 'Photo selected' : 'Upload photo'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Date and time
            </label>
            <input
              type="text"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Previous updates box */}
          {report.progressUpdates.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-700">Previous updates</div>
              {report.progressUpdates.map((u) => (
                <div key={u.id} className="text-slate-600">
                  <span className="font-medium text-slate-800">{u.timestamp}</span> ·{' '}
                  {u.description}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider border-2 border-[#0018FF] text-[#0018FF] hover:bg-[#0018FF]/5 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider bg-[#0018FF] text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              SAVE UPDATE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* RESOLVE REPORT MODAL                                                       */
/* -------------------------------------------------------------------------- */
interface ResolveReportModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { description: string; photoUrl?: string; resolutionDate?: string }) => void;
}

export const ResolveReportModal: React.FC<ResolveReportModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [description, setDescription] = useState('Waste removed from the riverbank.');
  const [resolutionDate, setResolutionDate] = useState('Aug 29, 2026');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onConfirm({
      description,
      photoUrl: photoPreview || undefined,
      resolutionDate,
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-lg font-bold text-[#0B1370]">Resolve Report</h2>
          <p className="text-[13px] text-[#4B5563] mt-1">
            Provide final resolution details and documentation before marking as resolved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Progress so far box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="font-bold text-slate-800">Progress so far</div>
            <div className="text-slate-600 mt-0.5">
              {report.progressUpdates.length} updates · last{' '}
              {report.progressUpdates[report.progressUpdates.length - 1]?.timestamp || 'recently'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Final resolution description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-[#9AA5B1] focus:border-2 focus:border-[#0018FF] rounded-lg p-3 text-sm text-slate-800 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Final photo / documentation
            </label>
            <label className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 text-xs text-slate-500">
              <Upload className="w-4 h-4 mb-1 text-slate-400" />
              <span>{photoPreview ? 'Photo attached' : 'Upload photo or document'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resolution date
            </label>
            <input
              type="text"
              value={resolutionDate}
              onChange={(e) => setResolutionDate(e.target.value)}
              className="w-full bg-white border border-[#9AA5B1] focus:border-2 focus:border-[#0018FF] rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider border-2 border-[#0018FF] text-[#0018FF] hover:bg-[#0018FF]/5 transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-lg inline-flex items-center justify-center font-bold text-[13px] tracking-wider bg-[#0018FF] text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              MARK AS RESOLVED
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* CONFIRM ARCHIVE MODAL                                                      */
/* -------------------------------------------------------------------------- */
interface ConfirmArchiveModalProps {
  report: ReportItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmArchiveModal: React.FC<ConfirmArchiveModalProps> = ({
  report,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div>
          <h2 className="text-lg font-bold text-[#0B1370]">Archive this report?</h2>
          <p className="text-[13px] text-[#4B5563] mt-2 leading-relaxed">
            <span className="font-mono font-bold text-slate-900">{report.id}</span> moves
            from RESOLVED to ARCHIVED. It leaves the active lists and the map and stays
            available, read-only, under Records / Archived with its full timeline.
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
            CONFIRM ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};
