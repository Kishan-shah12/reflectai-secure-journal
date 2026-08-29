import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertCircle, Plus, BookOpen, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  JournalSession,
  JournalMessage,
  JournalCategory,
  PersistenceState,
  PendingSaveTurn,
} from '../../types';
import { sendJournalChatMessage } from '../../services/geminiClient';
import {
  generateDocumentId,
  deriveJournalTitle,
  persistTurnToFirestore,
  getJournalMessages,
} from '../../services/journalService';
import { MessageBubble } from './MessageBubble';
import { JournalComposer } from './JournalComposer';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface JournalWorkspaceProps {
  currentJournal: JournalSession | null;
  onJournalCreatedOrUpdated: (journalId: string) => void;
  onNewJournal: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Reflect on my day',
    desc: 'Unpack key moments, wins, and subtle challenges from today.',
    category: 'reflection' as JournalCategory,
  },
  {
    title: 'Help me think through a decision',
    desc: 'Structure pros, cons, hidden assumptions, and emotional drivers.',
    category: 'brainstorming' as JournalCategory,
  },
  {
    title: 'Brainstorm an idea',
    desc: 'Explore divergent angles and next steps for a creative project.',
    category: 'brainstorming' as JournalCategory,
  },
  {
    title: 'Organize my thoughts',
    desc: 'Turn a whirlwind of mental noise into structured clarity.',
    category: 'general' as JournalCategory,
  },
];

export const JournalWorkspace: React.FC<JournalWorkspaceProps> = ({
  currentJournal,
  onJournalCreatedOrUpdated,
  onNewJournal,
}) => {
  const { user, getIdToken } = useAuth();

  // Active conversation state
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [activeCategory, setActiveCategory] = useState<JournalCategory>(
    currentJournal?.category || 'reflection'
  );
  const [activeTitle, setActiveTitle] = useState<string>(
    currentJournal?.title || 'New Reflection'
  );
  const [starterPromptText, setStarterPromptText] = useState<string>('');

  // Persistence & UI states
  const [persistenceState, setPersistenceState] = useState<PersistenceState>('idle');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Pending save turn for resilient retry without data loss
  const [pendingRetryTurn, setPendingRetryTurn] = useState<PendingSaveTurn | null>(null);

  // Active journal ID (persisted across turns in the same session)
  const [sessionJournalId, setSessionJournalId] = useState<string>(
    currentJournal?.id || ''
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll smoothly to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading, persistenceState]);

  // Load messages when currentJournal changes or when user resumes a session
  useEffect(() => {
    if (!user || !currentJournal) {
      setSessionJournalId('');
      setMessages([]);
      setActiveTitle('New Reflection');
      setActiveCategory('reflection');
      setPendingRetryTurn(null);
      setPersistenceState('idle');
      setGeneralError(null);
      return;
    }

    setSessionJournalId(currentJournal.id);
    setActiveTitle(currentJournal.title);
    setActiveCategory(currentJournal.category);
    setPendingRetryTurn(null);
    setPersistenceState('saved');
    setGeneralError(null);

    let isMounted = true;
    setIsMessagesLoading(true);

    getJournalMessages(user.uid, currentJournal.id)
      .then((loadedMessages) => {
        if (isMounted) {
          setMessages(loadedMessages);
          setIsMessagesLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[JournalWorkspace] Failed to load messages:', err);
          setGeneralError('Failed to load reflection history. Please try again.');
          setIsMessagesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentJournal?.id, user?.uid]);

  /**
   * Main turn submission handler:
   * 1. Updates UI state to SENDING -> AI RESPONDING
   * 2. Calls POST /api/journal/chat with multi-turn context
   * 3. Upon Gemini response, transitions state to SAVING
   * 4. Persists user turn + Gemini turn to Firestore users/{uid}/journals/{journalId}
   * 5. If Firestore save fails, transitions to ERROR and preserves pending turn for RETRY
   */
  const handleSendMessage = async (promptText: string, category: JournalCategory) => {
    if (!user) {
      setGeneralError('Your session expired. Please sign in again.');
      return;
    }

    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt) return;

    setGeneralError(null);
    setPersistenceState('sending');
    setIsAiLoading(true);

    // Determine or generate safe journalId
    const isFirstTurn = !sessionJournalId || messages.length === 0;
    const targetJournalId = sessionJournalId || generateDocumentId('j');
    if (!sessionJournalId) {
      setSessionJournalId(targetJournalId);
    }

    // Generate stable IDs for idempotency
    const userMessageId = generateDocumentId('msg_u');
    const modelMessageId = generateDocumentId('msg_m');
    const derivedTitle = isFirstTurn ? deriveJournalTitle(trimmedPrompt, category) : activeTitle;
    if (isFirstTurn) {
      setActiveTitle(derivedTitle);
    }

    // Optimistically create user message in local state
    const optimisticUserMessage: JournalMessage = {
      id: userMessageId,
      role: 'user',
      content: trimmedPrompt,
      timestamp: Date.now(),
      createdAt: null as any,
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    // Build bounded conversation context for multi-turn Gemini API
    const historyPayload = messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Step 1: Call Gemini 3.6 Flash backend
      setPersistenceState('ai-responding');
      const aiResponse = await sendJournalChatMessage({
        prompt: trimmedPrompt,
        messages: historyPayload,
        getIdToken: () => getIdToken(),
      });

      const modelResponseContent = aiResponse.responseText;

      // Optimistically create model message in local state
      const optimisticModelMessage: JournalMessage = {
        id: modelMessageId,
        role: 'model',
        content: modelResponseContent,
        timestamp: Date.now(),
        createdAt: null as any,
      };

      setMessages((prev) => [...prev, optimisticModelMessage]);
      setIsAiLoading(false);

      // Step 2: Persist turn to authenticated user's Firestore path
      setPersistenceState('saving');

      const turnPayload: PendingSaveTurn = {
        journalId: targetJournalId,
        userMessageId,
        userMessageContent: trimmedPrompt,
        modelMessageId,
        modelMessageContent: modelResponseContent,
        isFirstTurn,
        title: derivedTitle,
        category: category,
      };

      try {
        await persistTurnToFirestore({
          uid: user.uid,
          ...turnPayload,
        });

        // Persistence succeeded
        setPersistenceState('saved');
        setPendingRetryTurn(null);
        onJournalCreatedOrUpdated(targetJournalId);
      } catch (firestoreError: any) {
        console.error('[JournalWorkspace] Firestore persistence failed:', firestoreError);
        setPersistenceState('error');
        setPendingRetryTurn(turnPayload);
        setGeneralError('Your reflection was generated, but could not be saved to Firestore. Please click Retry Save.');
      }
    } catch (apiError: any) {
      setIsAiLoading(false);
      setPersistenceState('error');
      console.error('[JournalWorkspace] Gemini chat failed:', apiError);

      const errorMessage = apiError.message || 'Gemini is temporarily unavailable. Please try again.';
      setGeneralError(errorMessage);

      // Remove the optimistic user message if Gemini failed completely
      setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
      throw apiError;
    }
  };

  /**
   * Retries saving an un-persisted turn to Firestore without re-invoking Gemini
   */
  const handleRetrySave = async () => {
    if (!user || !pendingRetryTurn) return;

    setGeneralError(null);
    setPersistenceState('saving');

    try {
      await persistTurnToFirestore({
        uid: user.uid,
        ...pendingRetryTurn,
      });

      setPersistenceState('saved');
      setPendingRetryTurn(null);
      onJournalCreatedOrUpdated(pendingRetryTurn.journalId);
    } catch (err: any) {
      console.error('[JournalWorkspace] Retry save failed:', err);
      setPersistenceState('error');
      setGeneralError('Firestore save retry failed. Please check your network and try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      {/* Workspace Header */}
      <div className="shrink-0 pb-4 border-b border-[#D6D1C7]/70 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-serif font-semibold text-stone-900 tracking-tight">
              {activeTitle}
            </h1>
            <Badge variant="sage" size="sm">
              {activeCategory}
            </Badge>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-stone-400">
              <Lock className="w-3 h-3 text-[#2D6A4F]" /> E2E Path-Isolated
            </span>
          </div>
          <p className="text-xs text-stone-500 font-sans">
            Powered by Gemini 3.6 Flash &middot; Saved to your private Firestore
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <StatusIndicator state={persistenceState} />
          <Button
            id="btn-new-journal-header"
            variant="outline"
            size="sm"
            onClick={onNewJournal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New
          </Button>
        </div>
      </div>

      {/* Error / Retry Banner */}
      {generalError && (
        <div
          id="workspace-error-banner"
          className="mt-3 p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-center justify-between gap-3 text-xs text-red-800"
          role="alert"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="truncate">{generalError}</span>
          </div>
          {pendingRetryTurn && (
            <Button
              id="btn-retry-save"
              variant="outline"
              size="sm"
              onClick={handleRetrySave}
              isLoading={persistenceState === 'saving'}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="bg-white border-red-300 text-red-700 hover:bg-red-50 shrink-0"
            >
              Retry Save
            </Button>
          )}
        </div>
      )}

      {/* Conversation / Empty State Area */}
      <div
        className="flex-1 overflow-y-auto py-6 space-y-6 pr-1 font-sans"
        tabIndex={0}
        aria-label="Conversation messages"
      >
        {isMessagesLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Loading reflection history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col justify-center max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF3EE] text-[#2D6A4F] flex items-center justify-center mx-auto border border-[#2D6A4F]/20 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-medium text-stone-900">
                What's on your mind?
              </h2>
              <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                ReflectAI uses Gemini 3.6 Flash to help you unpack ideas, structure decisions, and explore personal thoughts with total privacy.
              </p>
            </div>

            {/* Starter Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  id={`starter-prompt-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveCategory(prompt.category);
                    setStarterPromptText(prompt.title);
                  }}
                  className="p-3.5 rounded-xl border border-[#D6D1C7]/80 bg-white/70 hover:bg-white hover:border-[#2D6A4F]/40 hover:shadow-xs transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-800 group-hover:text-[#2D6A4F]">
                      {prompt.title}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {prompt.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {prompt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages Stream */
          <div className="space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {/* Active AI Responding Indicator */}
            {isAiLoading && (
              <div className="flex items-start gap-3.5 group w-full">
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[#2D6A4F] text-white border border-[#245740] shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                </div>
                <div className="rounded-2xl p-4 bg-white text-stone-900 border border-[#D6D1C7]/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-medium text-stone-700">Gemini 3.6 Flash is reflecting...</span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Composer Footer */}
      <div className="shrink-0 pt-3 border-t border-[#D6D1C7]/60 bg-[#FBF9F5]">
        <JournalComposer
          onSendMessage={handleSendMessage}
          isLoading={isAiLoading || persistenceState === 'saving'}
          selectedCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          initialPromptValue={starterPromptText}
        />
      </div>
    </div>
  );
};
