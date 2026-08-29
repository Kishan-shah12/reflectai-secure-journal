import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Sparkles, Send } from 'lucide-react';
import { PersistenceState } from '../../types';

interface StatusIndicatorProps {
  state: PersistenceState;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state, className = '' }) => {
  switch (state) {
    case 'sending':
      return (
        <span
          id="status-sending"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium font-sans ${className}`}
          role="status"
          aria-live="polite"
        >
          <Clock className="w-3.5 h-3.5 animate-spin text-stone-500" />
          <span>Sending request...</span>
        </span>
      );
    case 'ai-responding':
      return (
        <span
          id="status-ai-responding"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 text-xs font-medium font-sans ${className}`}
          role="status"
          aria-live="polite"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
          <span>Reflecting with Gemini 3.6 Flash...</span>
        </span>
      );
    case 'saving':
      return (
        <span
          id="status-saving"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs font-medium font-sans ${className}`}
          role="status"
          aria-live="polite"
        >
          <Clock className="w-3.5 h-3.5 animate-spin text-stone-500" />
          <span>Saving to Firestore...</span>
        </span>
      );
    case 'saved':
      return (
        <span
          id="status-saved"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF3EE] text-[#2D6A4F] border border-[#2D6A4F]/20 text-xs font-medium font-sans ${className}`}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Saved & Isolated</span>
        </span>
      );
    case 'error':
      return (
        <span
          id="status-error"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium font-sans ${className}`}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Save failed (Retry available)</span>
        </span>
      );
    default:
      return null;
  }
};
