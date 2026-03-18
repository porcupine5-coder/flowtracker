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

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const userSettings = useQuery(api.cycles.getUserSettings);
  const cycles = useQuery(api.cycles.getCycles);
  const recentLogs = useQuery(api.cycles.getRecentLogs);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const isShreeya = loggedInUser?.email === "metheotakj@gmail.com";

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowLogModal(true);
  };

  const handleCloseModal = () => {
    setShowLogModal(false);
    setSelectedDate(null);
  };

  if (userSettings === undefined || cycles === undefined || recentLogs === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-[var(--bg)]/50 backdrop-blur-sm rounded-3xl border border-[var(--border)]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-3 border-[var(--primary)]/20 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-t-[var(--primary)] rounded-full animate-spin"></div>
          </div>
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
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-2xl md:text-3xl shadow-xl shadow-[var(--primary)]/20 rotate-3 transform hover:rotate-6 transition-transform">
            🌸
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Welcome back, {isShreeya ? "Shreeya" : (loggedInUser?.name || "Friend")}
            </h1>
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
        </div>
      </div>

      <AIAssistant isShreeya={isShreeya} />

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
    </div>
  );
}
