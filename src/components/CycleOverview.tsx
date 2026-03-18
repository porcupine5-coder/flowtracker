import { getCycleDay } from "../lib/cycle";
import { useTheme } from "./useTheme";

interface CycleOverviewProps {
  settings: any;
  cycles: any[];
  recentLogs: any[];
}

const phaseInfo: Record<string, { label: string; color: string; bg: string; description: string }> = {
  menstrual: { 
    label: "Menstrual", 
    color: "text-[var(--primary)]", 
    bg: "bg-[var(--surface)] border-[var(--primary)] glow-effect", 
    description: "Period phase" 
  },
  follicular: { 
    label: "Follicular", 
    color: "text-[var(--primary)]", 
    bg: "bg-[var(--surface)] border-[var(--primary)] rising-gradient", 
    description: "Building phase" 
  },
  ovulation: { 
    label: "Ovulation", 
    color: "text-[var(--primary)]", 
    bg: "bg-[var(--surface)] border-[var(--primary)] overflow-hidden", 
    description: "Peak fertility" 
  },
  luteal: { 
    label: "Luteal", 
    color: "text-[var(--primary)]", 
    bg: "bg-[var(--surface)] border-[var(--primary)]", 
    description: "Premenstrual phase" 
  },
};

export function CycleOverview({ settings }: CycleOverviewProps) {
  const { phase: currentPhase } = useTheme();

  const currentCycleDay = getCycleDay({
    lastPeriodStart: settings.lastPeriodStart,
    averageCycleLength: settings.averageCycleLength,
    averagePeriodLength: settings.averagePeriodLength,
  });

  const getDaysUntilNextPeriod = () => {
    if (!settings.lastPeriodStart) return null;
    const lastPeriodDate = new Date(settings.lastPeriodStart);
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(lastPeriodDate.getDate() + settings.averageCycleLength);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextPeriodDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilNext = getDaysUntilNextPeriod();
  const phase = currentPhase ? phaseInfo[currentPhase] : null;
  const progress = currentCycleDay
    ? Math.min((currentCycleDay / settings.averageCycleLength) * 100, 100)
    : 0;

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-5 transition-all duration-500">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Cycle Overview</h3>

      {!settings.lastPeriodStart ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-muted)]">Log your first period to see cycle data</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Phase */}
          {phase && (
            <div className={`relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-500 ${phase.bg}`}>
              {currentPhase === "ovulation" && (
                <div className="absolute inset-0 accent-highlight pointer-events-none" />
              )}
              <div className="relative z-10">
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Current Phase</p>
                <p className={`text-lg font-bold ${phase.color}`}>{phase.label}</p>
                <p className="text-xs text-[var(--text-muted)] font-medium">{phase.description}</p>
              </div>
              <div className={`relative z-10 text-3xl font-black ${phase.color}`}>
                Day {currentCycleDay}
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Next Period</p>
              <p className="text-lg font-bold text-[var(--text)]">
                {daysUntilNext !== null
                  ? daysUntilNext <= 0
                    ? "Due"
                    : `${daysUntilNext}d`
                  : "—"}
              </p>
              <p className="text-xs text-[var(--text-muted)]">days away</p>
            </div>
            <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Avg Cycle</p>
              <p className="text-lg font-bold text-[var(--text)]">{settings.averageCycleLength}d</p>
              <p className="text-xs text-[var(--text-muted)]">period: {settings.averagePeriodLength}d</p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentCycleDay && (
            <div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>Cycle progress</span>
                <span>{currentCycleDay} / {settings.averageCycleLength} days</span>
              </div>
              <div className="w-full bg-[var(--border)] rounded-full h-2">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
