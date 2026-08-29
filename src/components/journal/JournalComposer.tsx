import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, CornerDownLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { JournalCategory } from '../../types';

interface JournalComposerProps {
  onSendMessage: (prompt: string, category: JournalCategory) => Promise<void>;
  isLoading: boolean;
  selectedCategory: JournalCategory;
  onCategoryChange: (cat: JournalCategory) => void;
  disabled?: boolean;
  initialPromptValue?: string;
}

const MAX_PROMPT_CHARS = 10000;

export const JournalComposer: React.FC<JournalComposerProps> = ({
  onSendMessage,
  isLoading,
  selectedCategory,
  onCategoryChange,
  disabled = false,
  initialPromptValue = '',
}) => {
  const [prompt, setPrompt] = useState(initialPromptValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialPromptValue when parent provides a starter prompt
  useEffect(() => {
    if (initialPromptValue && initialPromptValue !== prompt) {
      setPrompt(initialPromptValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPromptValue]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || disabled || trimmed.length > MAX_PROMPT_CHARS) {
      return;
    }

    try {
      await onSendMessage(trimmed, selectedCategory);
      setPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Retain prompt in state if sending fails
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_PROMPT_CHARS;
  const isNearLimit = charCount > MAX_PROMPT_CHARS * 0.85;

  const categories: Array<{ id: JournalCategory; label: string }> = [
    { id: 'reflection', label: 'Reflection' },
    { id: 'brainstorming', label: 'Brainstorming' },
    { id: 'summary', label: 'Summary' },
    { id: 'general', label: 'General' },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 font-sans">
      {/* Category Pills Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Journal Mode">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={selectedCategory === cat.id}
              id={`cat-select-${cat.id}`}
              onClick={() => onCategoryChange(cat.id)}
              disabled={isLoading || disabled}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-all cursor-pointer select-none ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-stone-50 shadow-2xs font-semibold'
                  : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span
          className={`text-[11px] font-mono shrink-0 ${
            isOverLimit ? 'text-red-600 font-bold' : isNearLimit ? 'text-amber-700' : 'text-stone-400'
          }`}
          aria-live="polite"
        >
          {charCount.toLocaleString()} / {MAX_PROMPT_CHARS.toLocaleString()}
        </span>
      </div>

      {/* Textarea Composer Card */}
      <div className="relative rounded-2xl bg-white border border-[#D6D1C7]/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] focus-within:border-[#2D6A4F] focus-within:ring-2 focus-within:ring-[#2D6A4F]/10 transition-all p-3 sm:p-4">
        <label htmlFor="journal-prompt-input" className="sr-only">
          Journal prompt or reflection thoughts
        </label>
        <textarea
          id="journal-prompt-input"
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Share your thoughts, unpack a decision, or ask Gemini to help you reflect..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-hidden font-sans leading-relaxed min-h-[72px] max-h-[240px]"
        />

        {/* Footer controls inside composer */}
        <div className="mt-2 pt-2.5 border-t border-[#D6D1C7]/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[10px] font-mono text-stone-600">
              <CornerDownLeft className="w-2.5 h-2.5" /> Cmd+Enter
            </kbd>
            <span className="hidden sm:inline text-[11px]">to send</span>
          </div>

          <Button
            id="btn-send-prompt"
            type="submit"
            size="sm"
            variant="sage"
            isLoading={isLoading}
            disabled={!prompt.trim() || isOverLimit || disabled}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Reflect
          </Button>
        </div>
      </div>
    </form>
  );
};
