import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Calendar } from "./Calendar";
import { LogModal } from "./LogModal";
import { CycleOverview } from "./CycleOverview";
import { PredictionCard } from "./PredictionCard";
import { AIAssistant } from "./AIAssistant";
import { SettingsPanel } from "./SettingsPanel";
import { DailyCare } from "./DailyCare";
import { HoneycombLoader } from "./HoneycombLoader";
import { FeedbackForms } from "./FeedbackForms";
import { TypewriterWelcome } from "./TypewriterWelcome";

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPorcupineModal, setShowPorcupineModal] = useState(false);
  const userSettings = useQuery(api.cycles.getUserSettings);
  const cycles = useQuery(api.cycles.getCycles);
  const recentLogs = useQuery(api.cycles.getRecentLogs);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const SPECIAL_PORCUPINE_EMAIL = "metheotakj@gmail.com";
  const normalizedLoggedInEmail = (loggedInUser?.email || "").trim().toLowerCase();
  const isPorcupineUser = normalizedLoggedInEmail === SPECIAL_PORCUPINE_EMAIL;

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowLogModal(true);
  };

  const handleCloseModal = () => {
    setShowLogModal(false);
    setSelectedDate(null);
  };

  const handleWelcomeIconClick = () => {
    // Debug logging to verify exclusivity behavior.
    console.debug("[Porcupine] welcome icon clicked", {
      loggedInEmail: loggedInUser?.email,
      normalizedLoggedInEmail,
      isPorcupineUser,
    });

    if (!loggedInUser) {
      console.debug("[Porcupine] no loggedInUser; ignoring click.");
      return;
    }

    if (!isPorcupineUser) {
      console.debug("[Porcupine] user not eligible; ignoring click.");
      return;
    }

    console.debug("[Porcupine] opening modal.");
    setShowPorcupineModal(true);
  };

  if (userSettings === undefined || cycles === undefined || recentLogs === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-[var(--bg)]/50 backdrop-blur-sm rounded-3xl border border-[var(--border)]">
        <div className="flex flex-col items-center gap-4">
          <HoneycombLoader size={40} />
          <p className="text-sm font-medium text-[var(--text-muted)]">Synchronizing cycle data...</p>
        </div>
      </div>
    );
  }

  // Handle empty states gracefully if queries return null (but finished loading)
  const safeSettings = userSettings || {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    lastPeriodStart: undefined,
  };
  const safeCycles = cycles || [];
  const safeLogs = recentLogs || [];

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {isPorcupineUser ? (
            <button
              type="button"
              onClick={handleWelcomeIconClick}
              className="w-14 h-14 md:w-16 md:h-16 rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-xl shadow-[var(--primary)]/20 rotate-3 transform hover:rotate-6 transition-transform overflow-hidden border-2 border-white/20 cursor-pointer"
              aria-label="Open a special message"
              title="Tap for a special message"
            >
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-xl shadow-[var(--primary)]/20 rotate-3 transform hover:rotate-6 transition-transform overflow-hidden border-2 border-white/20">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <TypewriterWelcome
              userEmail={loggedInUser?.email}
              userName={loggedInUser?.name}
              className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight min-h-[2.2rem] md:min-h-[2.7rem]"
            />
            <p className="text-sm md:text-base text-[var(--text-muted)] font-medium">
              Your body, your rhythm. Let's track your journey today.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface)] text-[var(--text)] rounded-2xl border border-[var(--border)] font-semibold text-sm hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        <div className="md:col-span-1 xl:col-span-2">
          <Calendar
            onDateSelect={handleDateSelect}
            logs={safeLogs}
            cycles={safeCycles}
            userSettings={safeSettings}
          />
          <DailyCare />
        </div>
        <div className="space-y-5 md:space-y-6">
          <CycleOverview
            settings={safeSettings}
            cycles={safeCycles}
            recentLogs={safeLogs}
          />
          <PredictionCard
            settings={safeSettings}
            cycles={safeCycles}
          />
          <FeedbackForms />
        </div>
      </div>


      {/* Modals */}
      {showLogModal && selectedDate && (
        <LogModal date={selectedDate} onClose={handleCloseModal} />
      )}
      {showSettings && (
        <SettingsPanel
          settings={safeSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPorcupineModal && isPorcupineUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[200]"
          role="dialog"
          aria-modal="true"
          aria-label="Porcupine message"
          onMouseDown={(e) => {
            // Close on backdrop click only.
            if (e.currentTarget === e.target) setShowPorcupineModal(false);
          }}
        >
          <div className="bg-[var(--surface)] w-full max-w-md rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--text)] flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">
                      🦔
                    </span>
                    Personalized message
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    For {loggedInUser?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPorcupineModal(false)}
                  className="p-2 rounded-xl hover:bg-[var(--border)] transition-colors text-[var(--text-muted)]"
                  aria-label="Close message"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5">
                <p className="text-base md:text-lg font-semibold text-[var(--text)] leading-relaxed">
                  Mr. Porcupine is always there for you and loves you alot . I miss you too , i know i make you made and upset you alot but i will always t=be there for you when noone is i promsie to be there in hardtimes , so don;t think twice to come to me when you need someone to talk to or when you just want to vent . I care about you so much and i want you to be happy and healthy always <span className="text-xl" aria-hidden="true">❤️</span>
                </p>
              </div>

              <div className="mt-4 text-sm text-[var(--text-muted)]">
                Tap the icon next to your welcome message to see this again anytime.
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPorcupineModal(false)}
                  className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
