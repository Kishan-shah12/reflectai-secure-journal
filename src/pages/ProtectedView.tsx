import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { IconButton } from '../components/ui/IconButton';
import { 
  Sparkles, 
  History, 
  Shield, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Menu, 
  X, 
  ShieldCheck, 
  Lock,
  BookOpen
} from 'lucide-react';
import { JournalSession } from '../types';
import { getUserJournals } from '../services/journalService';
import { JournalWorkspace } from '../components/journal/JournalWorkspace';
import { JournalHistoryList } from '../components/journal/JournalHistoryList';

interface ProtectedViewProps {
  currentRoute: 'dashboard' | 'history' | 'security';
  onNavigate: (route: 'dashboard' | 'history' | 'security') => void;
}

export const ProtectedView: React.FC<ProtectedViewProps> = ({ currentRoute, onNavigate }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userJournals, setUserJournals] = useState<JournalSession[]>([]);
  const [activeJournal, setActiveJournal] = useState<JournalSession | null>(null);
  const [isJournalsLoading, setIsJournalsLoading] = useState(false);

  // Load user journals from private Firestore path users/{uid}/journals
  const loadJournals = useCallback(async () => {
    if (!user) return;
    setIsJournalsLoading(true);
    try {
      const list = await getUserJournals(user.uid, 25);
      setUserJournals(list);
    } catch (err) {
      console.error('[ProtectedView] Error loading journals:', err);
    } finally {
      setIsJournalsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  // Handler for when a turn is saved or journal created
  const handleJournalCreatedOrUpdated = (journalId: string) => {
    loadJournals();
  };

  // Handler for creating a fresh journal
  const handleNewJournal = () => {
    setActiveJournal(null);
    if (currentRoute !== 'dashboard') {
      onNavigate('dashboard');
    }
  };

  // Handler for deleting a journal session
  const handleDeleteJournal = async (journalId: string) => {
    if (!user) return;
    const { deleteJournalSession } = await import('../services/journalService');
    await deleteJournalSession(user.uid, journalId);
    if (activeJournal?.id === journalId) {
      setActiveJournal(null);
    }
    await loadJournals();
  };

  // Handler for opening an existing journal from history
  const handleSelectJournal = (journal: JournalSession) => {
    setActiveJournal(journal);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Editorial Navigation Header */}
      <header className="border-b border-[#D6D1C7]/60 bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={() => {
                handleNewJournal();
                onNavigate('dashboard');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNewJournal();
                  onNavigate('dashboard');
                }
              }}
              aria-label="ReflectAI Home - New Session"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-amber-50 shadow-xs border border-stone-800 transition-transform group-hover:scale-105">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900 block leading-none">
                  ReflectAI
                </span>
                <span className="text-[10px] tracking-wide text-stone-500 uppercase font-sans font-medium">
                  Personal Gemini Journal
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1" role="tablist" aria-label="Main Navigation">
              <button
                id="nav-tab-workspace"
                role="tab"
                aria-selected={currentRoute === 'dashboard'}
                aria-controls="panel-workspace"
                onClick={() => onNavigate('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'dashboard'
                    ? 'bg-stone-900 text-stone-50 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                Workspace
              </button>
              <button
                id="nav-tab-history"
                role="tab"
                aria-selected={currentRoute === 'history'}
                aria-controls="panel-history"
                onClick={() => onNavigate('history')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'history'
                    ? 'bg-stone-900 text-stone-50 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                History ({userJournals.length})
              </button>
              <button
                id="nav-tab-security"
                role="tab"
                aria-selected={currentRoute === 'security'}
                aria-controls="panel-security"
                onClick={() => onNavigate('security')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentRoute === 'security'
                    ? 'bg-stone-900 text-stone-50 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                }`}
              >
                Trust Center
              </button>
            </nav>
          </div>

          {/* User Account and Controls */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-white border border-[#D6D1C7]/70 shadow-2xs">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="w-6 h-6 rounded-full border border-stone-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#EBF3EE] text-[#2D6A4F] font-serif font-bold text-xs flex items-center justify-center">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-stone-800 max-w-[130px] truncate">
                {user?.displayName || 'Active Account'}
              </span>
            </div>

            <IconButton
              id="btn-sign-out"
              label="Sign Out of Session"
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-stone-600 hover:text-stone-900"
            >
              <LogOut className="w-4 h-4" />
            </IconButton>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <IconButton
                label="Toggle Navigation Menu"
                variant="ghost"
                size="sm"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </IconButton>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#D6D1C7]/60 bg-[#FAF8F5] px-4 py-3 space-y-2">
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentRoute === 'dashboard' ? 'bg-stone-900 text-white' : 'text-stone-700'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => {
                onNavigate('history');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentRoute === 'history' ? 'bg-stone-900 text-white' : 'text-stone-700'
              }`}
            >
              History ({userJournals.length})
            </button>
            <button
              onClick={() => {
                onNavigate('security');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentRoute === 'security' ? 'bg-stone-900 text-white' : 'text-stone-700'
              }`}
            >
              Trust Center
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentRoute === 'dashboard' && (
          <div id="panel-workspace" role="tabpanel" aria-labelledby="nav-tab-workspace">
            <JournalWorkspace
              currentJournal={activeJournal}
              onJournalCreatedOrUpdated={handleJournalCreatedOrUpdated}
              onNewJournal={handleNewJournal}
            />
          </div>
        )}

        {currentRoute === 'history' && (
          <div id="panel-history" role="tabpanel" aria-labelledby="nav-tab-history" className="max-w-4xl mx-auto">
            <JournalHistoryList
              journals={userJournals}
              activeJournalId={activeJournal?.id}
              onSelectJournal={handleSelectJournal}
              onNewJournal={handleNewJournal}
              onDeleteJournal={handleDeleteJournal}
              isLoading={isJournalsLoading}
            />
          </div>
        )}

        {currentRoute === 'security' && (
          <div id="panel-security" role="tabpanel" aria-labelledby="nav-tab-security" className="space-y-6 max-w-4xl mx-auto">
            <div className="pb-6 border-b border-[#D6D1C7]/60">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Architecture & Security
              </span>
              <h1 className="text-3xl font-serif font-normal text-stone-950 mt-1">
                Trust Center & Compliance Lock
              </h1>
              <p className="text-sm text-stone-600 mt-1 font-sans">
                Factually supported security boundaries and zero-trust data protection principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default" padding="md" className="space-y-3">
                <div className="flex items-center space-x-2 text-stone-900 font-serif font-bold text-base">
                  <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Firebase Federated Identity</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Authentication is performed strictly via Google Sign-In with Firebase Auth. No raw passwords or user credentials are stored or handled in application code.
                </p>
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D6D1C7]/60 font-mono text-[11px] text-stone-800">
                  Status: Private Workspace &bull; Authenticated Session
                </div>
              </Card>

              <Card variant="default" padding="md" className="space-y-3">
                <div className="flex items-center space-x-2 text-stone-900 font-serif font-bold text-base">
                  <Lock className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Cloud Firestore ABAC</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  Owner-bound Firestore Security Rules enforce strict path verification (`request.auth.uid == uid`). Default-deny behavior rejects all unauthorized cross-tenant queries.
                </p>
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#D6D1C7]/60 font-mono text-[11px] text-stone-800">
                  Rules Version: 2 • Owner Path Isolation
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#D6D1C7]/60 py-6 bg-[#FAF8F5] text-stone-500 text-xs font-sans mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-semibold text-stone-800">ReflectAI</span>
            <span>•</span>
            <span>Personal Gemini Journal</span>
          </div>
          <div>
            <span>Google Cloud Run • Firebase Auth • Cloud Firestore • Gemini 3.6 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
