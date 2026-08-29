import React, { useState, useMemo } from 'react';
import { Plus, BookOpen, Clock, Calendar, ChevronRight, Sparkles, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';
import { JournalSession, JournalCategory } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { Modal } from '../ui/Modal';

interface JournalHistoryListProps {
  journals: JournalSession[];
  activeJournalId?: string;
  onSelectJournal: (journal: JournalSession) => void;
  onNewJournal: () => void;
  onDeleteJournal?: (journalId: string) => Promise<void>;
  isLoading: boolean;
}

export const JournalHistoryList: React.FC<JournalHistoryListProps> = ({
  journals,
  activeJournalId,
  onSelectJournal,
  onNewJournal,
  onDeleteJournal,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [journalToDelete, setJournalToDelete] = useState<JournalSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const getCategoryBadgeVariant = (cat: string): 'sage' | 'amber' | 'blue' | 'neutral' => {
    switch (cat) {
      case 'reflection':
        return 'sage';
      case 'brainstorming':
        return 'amber';
      case 'summary':
        return 'blue';
      default:
        return 'neutral';
    }
  };

  // Filter journals based on search and category
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const matchesSearch =
        !searchQuery.trim() ||
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (j.initialPrompt && j.initialPrompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (j.latestResponse && j.latestResponse.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedFilterCategory === 'all' || j.category === selectedFilterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [journals, searchQuery, selectedFilterCategory]);

  const handleDeleteConfirm = async () => {
    if (!journalToDelete || !onDeleteJournal) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onDeleteJournal(journalToDelete.id);
      setJournalToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete reflection. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Header and New Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-serif font-medium text-stone-900">Your Journal Archive</h2>
          <p className="text-xs text-stone-500">Chronologically isolated in your private space</p>
        </div>
        <Button
          id="btn-new-reflection-history"
          variant="primary"
          size="sm"
          onClick={onNewJournal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Entry
        </Button>
      </div>

      {/* Search and Category Filter Bar */}
      {journals.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="search-journal-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past reflections and insights..."
              aria-label="Search past reflections and insights"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white border border-[#D6D1C7]/80 placeholder:text-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] transition-all"
            />
          </div>

          <div
            className="flex items-center gap-1 overflow-x-auto pb-1"
            role="radiogroup"
            aria-label="Filter archive by category"
          >
            {['all', 'reflection', 'brainstorming', 'summary', 'general'].map((cat) => (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={selectedFilterCategory === cat}
                id={`filter-cat-${cat}`}
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilterCategory === cat
                    ? 'bg-stone-900 text-stone-50 shadow-2xs font-semibold'
                    : 'bg-stone-100/90 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2.5" aria-live="polite" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-[#D6D1C7]/60 bg-white/60 animate-pulse space-y-2"
            >
              <div className="h-4 bg-stone-200 rounded w-1/3" />
              <div className="h-3 bg-stone-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && journals.length === 0 && (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#D6D1C7] bg-stone-50/50">
          <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2.5 stroke-1" />
          <h3 className="text-sm font-serif font-medium text-stone-800">No reflections saved yet</h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 mb-4">
            Start your first conversation with Gemini 3.6 Flash to reflect on your day.
          </p>
          <Button
            id="btn-start-first-journal"
            variant="sage"
            size="sm"
            onClick={onNewJournal}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Start First Reflection
          </Button>
        </div>
      )}

      {/* Filtered Empty State */}
      {!isLoading && journals.length > 0 && filteredJournals.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border border-[#D6D1C7]/60 bg-white/50 text-xs text-stone-500">
          No reflections found matching your search.
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedFilterCategory('all');
            }}
            className="block mx-auto mt-2 text-[#2D6A4F] font-medium hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Journal Cards List */}
      {!isLoading && filteredJournals.length > 0 && (
        <div
          className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1"
          role="feed"
          aria-label="Reflection entries"
        >
          {filteredJournals.map((journal) => {
            const isActive = activeJournalId === journal.id;
            const dateStr = journal.createdAt?.toDate
              ? journal.createdAt.toDate().toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={journal.id}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all relative group ${
                  isActive
                    ? 'bg-[#EBF3EE]/70 border-[#2D6A4F]/40 shadow-xs'
                    : 'bg-white border-[#D6D1C7]/70 hover:border-stone-400 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    id={`journal-item-${journal.id}`}
                    onClick={() => onSelectJournal(journal)}
                    className="space-y-1 min-w-0 flex-1 text-left cursor-pointer focus-visible:outline-none"
                    aria-label={`Open reflection: ${journal.title}`}
                  >
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-serif font-medium truncate ${
                          isActive ? 'text-[#2D6A4F] font-semibold' : 'text-stone-900 group-hover:text-stone-950'
                        }`}
                      >
                        {journal.title}
                      </h4>
                      <Badge variant={getCategoryBadgeVariant(journal.category)} size="sm">
                        {journal.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {journal.latestResponse || journal.initialPrompt || 'No preview available'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {onDeleteJournal && (
                      <IconButton
                        label={`Delete reflection: ${journal.title}`}
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setJournalToDelete(journal);
                        }}
                        className="text-stone-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectJournal(journal)}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="p-1 cursor-pointer"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? 'text-[#2D6A4F] translate-x-0.5'
                            : 'text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(journalToDelete)}
        onClose={() => {
          if (!isDeleting) setJournalToDelete(null);
        }}
        title="Delete Reflection Entry"
        description="This will permanently delete this reflection and all associated conversation history from your isolated Firestore subcollection. This action cannot be undone."
      >
        <div className="space-y-4 pt-2">
          {deleteError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700" role="alert">
              {deleteError}
            </div>
          )}

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-700">
            <span className="font-semibold block text-stone-900 truncate">
              {journalToDelete?.title}
            </span>
            <span className="text-stone-500 font-sans mt-0.5 block">
              Category: {journalToDelete?.category}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              id="btn-cancel-delete"
              variant="outline"
              size="sm"
              onClick={() => setJournalToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              id="btn-confirm-delete"
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

