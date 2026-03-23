import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { themes, applyTheme } from "../lib/theme";
import { useTheme } from "./useTheme";

interface SettingsPanelProps {
  settings: any;
  onClose: () => void;
}

export function SettingsPanel({ settings, onClose }: SettingsPanelProps) {
  const updateUserSettings = useMutation(api.cycles.updateUserSettings);
  const { isDarkMode } = useTheme();

  const [cycleLength, setCycleLength] = useState(settings.averageCycleLength || 28);
  const [periodLength, setPeriodLength] = useState(settings.averagePeriodLength || 5);
  const [partnerEmail, setPartnerEmail] = useState(settings.partnerEmail || "");
  const [enableSharing, setEnableSharing] = useState(settings.enablePartnerSharing || false);
  const [selectedTheme, setSelectedTheme] = useState(settings.themeName || "");
  const [calendarMode, setCalendarMode] = useState<"full" | "border">(settings.calendarMode || "full");
  const [isSaving, setIsSaving] = useState(false);

  // Apply preview theme immediately
  useEffect(() => {
    if (selectedTheme) {
      applyTheme(isDarkMode, selectedTheme);
    }
  }, [selectedTheme, isDarkMode]);

  // Revert theme if cancelled
  const handleClose = () => {
    applyTheme(isDarkMode, settings.themeName);
    onClose();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserSettings({
        averageCycleLength: cycleLength,
        averagePeriodLength: periodLength,
        partnerEmail: enableSharing ? partnerEmail : undefined,
        enablePartnerSharing: enableSharing,
        themeName: selectedTheme || undefined,
        calendarMode,
      });
      toast.success("Settings saved", { duration: 2000 });
      onClose();
    } catch {
      toast.error("Failed to save settings");
      // Revert on error
      applyTheme(isDarkMode, settings.themeName);
    } finally {
      setIsSaving(false);
    }
  };

  const availableThemes = isDarkMode ? themes.dark : themes.light;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-[var(--surface)] w-full sm:rounded-2xl sm:max-w-lg shadow-2xl grid grid-rows-[auto_minmax(0,1fr)_auto] rounded-t-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-[var(--border)] bg-[var(--surface)] rounded-t-2xl">
          <h2 className="text-base font-semibold text-[var(--text)]">Settings</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-muted)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-5 overflow-y-auto">
          {/* Theme Selection */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Color Scheme</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(availableThemes).map(([name, colors]: [string, any]) => (
                <button
                  key={name}
                  onClick={() => setSelectedTheme(name)}
                  className={`flex flex-col p-2 rounded-xl border-2 transition-all ${
                    selectedTheme === name
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg)]"
                  }`}
                >
                  <div className="flex gap-1 mb-2 justify-center">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.secondary }} />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.accent }} />
                  </div>
                  <span className="text-[10px] font-medium text-center capitalize text-[var(--text)]">
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cycle Settings */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Cycle Settings</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text)] mb-1.5">
                  Average cycle length: <span className="font-semibold text-[var(--primary)]">{cycleLength} days</span>
                </label>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                  <span>21 days</span>
                  <span>45 days</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[var(--text)] mb-1.5">
                  Average period length: <span className="font-semibold text-[var(--primary)]">{periodLength} days</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[var(--border)] rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                  <span>2 days</span>
                  <span>10 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Display Mode */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Calendar Appearance</p>
            <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] shadow-inner">
              <button
                onClick={() => setCalendarMode("full")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  calendarMode === "full" 
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm border border-[var(--border-strong)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
                Full Color
              </button>
              <button
                onClick={() => setCalendarMode("border")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  calendarMode === "border" 
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm border border-[var(--border-strong)]" 
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <div className="w-3 h-3 rounded-full border-2 border-[var(--primary)] bg-transparent" />
                Border Only
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 ml-1">
              Choose between solid phase colors or a minimalist outlined style.
            </p>
          </div>

          {/* Partner Sharing */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Partner Sharing</p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enableSharing}
                    onChange={(e) => setEnableSharing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[var(--border)] rounded-full peer peer-checked:bg-[var(--primary)] transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                </div>
                <span className="text-sm font-medium text-[var(--text)]">Enable sharing</span>
              </label>

              {enableSharing && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-medium text-[var(--text-muted)]">Partner's Email</label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-2xl">
          <button
            onClick={() => { void handleSave(); }}
            disabled={isSaving}
            className="w-full bg-[var(--primary)] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-[var(--primary)]/20"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
