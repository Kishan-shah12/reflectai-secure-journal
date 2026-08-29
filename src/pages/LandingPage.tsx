import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  CheckCircle2, 
  ShieldAlert, 
  BrainCircuit, 
  ChevronRight,
  UserCheck,
  Server
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigateToDashboard?: () => void }> = ({ onNavigateToDashboard }) => {
  const { user, signInWithGoogle, loading, error, clearError } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Editorial Navigation Header */}
      <header className="border-b border-[#D6D1C7]/60 bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-amber-50 shadow-xs border border-stone-800">
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

          <div className="flex items-center space-x-3">
            {user ? (
              <Button
                id="btn-nav-enter"
                variant="primary"
                size="sm"
                onClick={onNavigateToDashboard}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Enter Journal
              </Button>
            ) : (
              <Button
                id="btn-nav-google-signin"
                variant="outline"
                size="sm"
                onClick={signInWithGoogle}
                isLoading={loading}
                leftIcon={
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                }
              >
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 flex flex-col items-center">
        {error && (
          <div
            role="alert"
            className="w-full max-w-lg mb-8 p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-800 text-sm flex items-start justify-between shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              aria-label="Dismiss error"
              className="ml-3 font-semibold text-red-500 hover:text-red-700 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Value Proposition Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EE] border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-medium font-sans shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Strict Owner-Bound Isolation • Gemini 3.6 Flash</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-stone-950 text-center max-w-4xl tracking-tight leading-[1.08]">
          Your thoughts. <br />
          <span className="italic font-serif text-stone-800">A smarter way to reflect.</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-stone-600 text-center max-w-2xl font-sans leading-relaxed">
          Talk with Gemini 3.6 Flash, turn multi-turn reflections into structured takeaways, and keep every journal entry private under authenticated Firestore security rules.
        </p>

        {/* Action CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {user ? (
            <Button
              id="btn-hero-enter"
              size="lg"
              variant="primary"
              onClick={onNavigateToDashboard}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto text-base font-semibold shadow-md"
            >
              Continue to Workspace
            </Button>
          ) : (
            <Button
              id="btn-hero-google-signin"
              size="lg"
              variant="primary"
              onClick={signInWithGoogle}
              isLoading={loading}
              leftIcon={
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              }
              className="w-full sm:w-auto text-base font-semibold shadow-md px-8"
            >
              Sign in with Google
            </Button>
          )}
        </div>

        {/* Fact-Based Trust Signals */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-stone-500 font-sans">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#2D6A4F]" /> Google Authentication
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#2D6A4F]" /> Path-Bound Firestore ABAC
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#2D6A4F]" /> Server-Side Gemini Invocations
          </span>
        </div>

        {/* High-Refinement Product UI Preview Mockup (Static Demonstration) */}
        <div className="mt-14 sm:mt-18 w-full max-w-4xl">
          <div className="rounded-3xl p-2 sm:p-3 bg-[#EFECE4]/60 border border-[#D6D1C7] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]">
            <div className="rounded-2xl bg-white border border-[#D6D1C7]/80 overflow-hidden shadow-xs">
              {/* Window Bar */}
              <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#D6D1C7]/60 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <span className="ml-2 font-mono text-[11px] text-stone-500">
                    ReflectAI Workspace / session-2026-08
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="sage" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                    Firestore Isolated
                  </Badge>
                </div>
              </div>

              {/* Mock Workspace Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* User Journal Prompt */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xs font-serif shrink-0">
                    K
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-xs font-medium text-stone-500">You • Morning Reflection</div>
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D6D1C7]/60 text-stone-800 text-sm font-sans leading-relaxed">
                      "I completed our product launch this week. While the deliverables succeeded, I feel depleted and want to examine how to protect deep-focus hours going into next sprint."
                    </div>
                  </div>
                </div>

                {/* Gemini Model Reflection Turn */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-xs font-serif shrink-0 shadow-2xs">
                    ✦
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-stone-500">Gemini 3.6 Flash</span>
                      <Badge variant="amber" size="sm">Insight</Badge>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-[#D6D1C7]/80 text-stone-800 text-sm leading-relaxed shadow-2xs space-y-3 font-sans">
                      <p>
                        Congratulations on crossing the launch milestone. Post-launch depletion is common when high cognitive adrenaline subsides.
                      </p>
                      <p className="text-stone-700">
                        Let us structure your reflection around two levers: <strong className="text-stone-900 font-medium">Reclaiming Calendar Sovereignty</strong> and <strong className="text-stone-900 font-medium">Post-Milestone Energy Recovery</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reflection Takeaway Card Preview */}
                <div className="pl-12">
                  <div className="p-4 rounded-xl bg-[#F9F3EA] border border-[#9A6B2F]/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-[#9A6B2F]">Synthesized Takeaways</span>
                      <span className="text-[11px] text-stone-500 font-sans">Automatic Summary</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="amber" size="sm">Boundary Setting</Badge>
                      <Badge variant="sage" size="sm">Energy Management</Badge>
                      <Badge variant="neutral" size="sm">Sprint Retrospective</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Pillars Section */}
        <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <Card variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] border border-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F] mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-stone-900">Multi-Turn Dialogue</h2>
            <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
              Engage in multi-turn conversations with Gemini 3.6 Flash to explore complex ideas, unpack emotions, and uncover deeper insights.
            </p>
          </Card>

          <Card variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] border border-[#D6D1C7] flex items-center justify-center text-stone-800 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-stone-900">Zero-Trust Privacy</h2>
            <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
              Every journal record is stored in owner-bound Firestore subcollections under <code className="text-xs bg-stone-100 px-1 py-0.5 rounded font-mono">/users/{'{uid}'}/journals</code>.
            </p>
          </Card>

          <Card variant="interactive" padding="lg">
            <div className="w-10 h-10 rounded-xl bg-[#F9F3EA] border border-[#9A6B2F]/20 flex items-center justify-center text-[#9A6B2F] mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-stone-900">Actionable Vault</h2>
            <p className="mt-2 text-sm text-stone-600 font-sans leading-relaxed">
              Extract structured takeaways, themes, and action checklists from any conversation, archived chronologically for future review.
            </p>
          </Card>
        </div>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#D6D1C7]/60 py-8 bg-[#FAF8F5] text-stone-500 text-xs font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-semibold text-stone-800">ReflectAI</span>
            <span>•</span>
            <span>Personal Gemini Journal</span>
          </div>
          <div>
            <span>Powered by Google Cloud Run • Firebase Auth • Cloud Firestore • Gemini 3.6 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
