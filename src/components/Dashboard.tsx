import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Calendar } from "./Calendar";
import { LogModal } from "./LogModal";
import { CycleOverview } from "./CycleOverview";
import { PredictionCard } from "./PredictionCard";
import { AIAssistant } from "./AIAssistant";
import { SettingsPanel } from "./SettingsPanel";

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

  if (!userSettings || !cycles || !recentLogs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin"></div>
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
        <div className="md:col-span-1 xl:col-span-2">
          <Calendar
            onDateSelect={handleDateSelect}
            logs={recentLogs}
            cycles={cycles}
          />
        </div>
        <div className="space-y-5 md:space-y-6">
          <CycleOverview
            settings={userSettings}
            cycles={cycles}
            recentLogs={recentLogs}
          />
          <PredictionCard
            settings={userSettings}
            cycles={cycles}
          />
        </div>
      </div>

      {/* Modals */}
      {showLogModal && selectedDate && (
        <LogModal date={selectedDate} onClose={handleCloseModal} />
      )}
      {showSettings && (
        <SettingsPanel
          settings={userSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* AI Assistant - available to all users */}
      <AIAssistant isShreeya={isShreeya} />
    </div>
  );
}
