import React from 'react';
import { ReportStatus } from '../types';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const padding = isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';
  const baseClasses = `inline-flex items-center gap-1.5 font-bold rounded-full whitespace-nowrap tracking-wide select-none ${padding}`;

  switch (status) {
    case 'SUBMITTED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span>SUBMITTED</span>
        </span>
      );
    case 'UNDER_VERIFICATION':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#FFF1C2', color: '#7A4B00' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5" />
          </svg>
          <span>UNDER VERIFICATION</span>
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#CCFBF1', color: '#0F766E' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4 10-10" />
          </svg>
          <span>VERIFIED</span>
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#E3E7FF', color: '#0018FF' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          <span>ASSIGNED</span>
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#FFEDD5', color: '#B45309' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3" />
          </svg>
          <span>IN PROGRESS</span>
        </span>
      );
    case 'RESOLVED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6" />
          </svg>
          <span>RESOLVED</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#FEE2E2', color: '#D60E00' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
          <span>REJECTED</span>
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className={baseClasses} style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5h18v4H3zM5 9v10h14V9M10 13h4" />
          </svg>
          <span>ARCHIVED</span>
        </span>
      );
    default:
      return null;
  }
};
