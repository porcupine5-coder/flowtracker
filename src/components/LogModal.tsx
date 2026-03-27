import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { 
  symptomRecommendations, 
  moodRecommendations,
  Recommendation 
} from "../lib/recommendations";
import { RingLoader } from "./RingLoader";

interface LogModalProps {
  date: string;
  onClose: () => void;
}

const flowOptions = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

const symptomOptions = [
  "Bloating", "Headache", "Fever", "Cold", "Cramps", "Mood swings", "Fatigue", "Breast tenderness"
];

const moodOptions = [
  { value: "happy", label: "Happy" },
  { value: "sad", label: "Sad" },
  { value: "anxious", label: "Anxious" },
  { value: "irritated", label: "Irritated" },
  { value: "energetic", label: "Energetic" },
  { value: "tired", label: "Tired" },
];

const cervicalMucusOptions = [
  { value: "dry", label: "Dry" },
  { value: "sticky", label: "Sticky" },
  { value: "creamy", label: "Creamy" },
  { value: "watery", label: "Watery" },
  { value: "egg-white", label: "Egg White" },
];

export function LogModal({ date, onClose }: LogModalProps) {
  const dailyLog = useQuery(api.cycles.getDailyLog, { date });
  const currentPhase = useQuery(api.cycles.getCurrentPhase, { date });
  const userSettings = useQuery(api.cycles.getUserSettings);
  const cycles = useQuery(api.cycles.getCycles);
  const updateDailyLog = useMutation(api.cycles.updateDailyLog);
  const startNewCycle = useMutation(api.cycles.startNewCycle);
  const endPeriodEarly = useMutation(api.cycles.endPeriodEarly);

  const [flow, setFlow] = useState<"none" | "light" | "medium" | "heavy" | "">("");
  const [symptomDetails, setSymptomDetails] = useState<{name: string, severity: number}[]>([]);
  const [mood, setMood] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [otherSymptoms, setOtherSymptoms] = useState("");
  const [temperature, setTemperature] = useState<number | "">("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const liveRecommendations = useMemo(() => {
    const list: Recommendation[] = [];
    symptomDetails.forEach(s => {
      if (symptomRecommendations[s.name]) {
        list.push(...symptomRecommendations[s.name]);
      }
    });
    if (mood && moodRecommendations[mood]) {
      list.push(...moodRecommendations[mood]);
    }
    // Deduplicate by ID
    const unique = Array.from(new Map(list.map(item => [item.id, item])).values());
    return unique.slice(0, 2);
  }, [symptomDetails, mood]);

  // Emergency detection logic
  const emergencyDetected = useMemo(() => {
    const severeSymptoms = symptomDetails.filter(s => s.severity >= 4);
    // Fever + severe headache/cramps could be an emergency
    const hasFever = severeSymptoms.some(s => s.name === "Fever");
    const hasSeverePain = severeSymptoms.some(s => s.name === "Cramps" || s.name === "Headache");
    return (hasFever && hasSeverePain) || severeSymptoms.length >= 3;
  }, [symptomDetails]);

  // Check if this date is part of an active (not yet ended) period.
  // Uses per-cycle periodLength when available so that after an early
  // termination the button disappears on subsequent days.
  const activeCycle = cycles?.[0];
  const effectivePeriodLength =
    activeCycle?.periodLength ?? (userSettings?.averagePeriodLength ?? 5);
  const isDateInActivePeriod = activeCycle && !activeCycle.endDate && (() => {
    const start = new Date(activeCycle.startDate);
    const check = new Date(date);
    const diff = Math.floor((check.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < effectivePeriodLength;
  })();

  const handleEndPeriodEarly = async () => {
    try {
      await endPeriodEarly({ periodEndDate: date });
      toast.success("Period marked as ended");
      onClose();
    } catch {
      toast.error("Failed to end period early");
    }
  };

  useEffect(() => {
    if (dailyLog) {
      setFlow(dailyLog.flow || "");
      setSymptomDetails(dailyLog.symptomDetails || []);
      setMood(dailyLog.mood || "");
      setNotes(dailyLog.notes || "");
      setOtherSymptoms(dailyLog.otherSymptoms || "");
      setTemperature(dailyLog.temperature || "");
      setCervicalMucus(dailyLog.cervicalMucus || "");
    }
  }, [dailyLog]);

  const handleSymptomToggle = (symptomName: string) => {
    setSymptomDetails((prev) => {
      const existing = prev.find(s => s.name === symptomName);
      if (existing) {
        return prev.filter(s => s.name !== symptomName);
      } else {
        return [...prev, { name: symptomName, severity: 3 }]; // Default to moderate
      }
    });
  };

  const handleSeverityChange = (symptomName: string, severity: number) => {
    setSymptomDetails(prev => prev.map(s => 
      s.name === symptomName ? { ...s, severity } : s
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDailyLog({
        date,
        flow: flow === "" ? undefined : flow,
        symptoms: symptomDetails.map(s => s.name), // Keep legacy field updated
        symptomDetails: symptomDetails.length > 0 ? symptomDetails : undefined,
        otherSymptoms: otherSymptoms || undefined,
        emergencyFlag: emergencyDetected,
        mood: mood === "" ? undefined : mood,
        notes: notes || undefined,
        temperature: temperature === "" ? undefined : temperature,
        cervicalMucus: cervicalMucus === "" ? undefined : cervicalMucus,
      });

      if (flow && flow !== "none" && (!dailyLog?.flow || dailyLog.flow === "none")) {
        await startNewCycle({ startDate: date });
      }

      if (emergencyDetected) {
        toast.warning("Emergency Alert: Based on your severe symptoms, please consider contacting a healthcare provider.", { duration: 10000 });
      } else {
        toast.success("Log saved successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save log. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  const phaseColors: Record<string, string> = {
    menstrual: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    follicular: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    ovulation: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    luteal: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[9999]">
      <div className="bg-[var(--surface)] w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">Daily Log</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(date)}</p>
          </div>
          <div className="flex items-center gap-2">
            {isDateInActivePeriod && (
              <button
                onClick={() => void handleEndPeriodEarly()}
                className="text-[10px] font-bold px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors uppercase tracking-wider"
              >
                End Period Early
              </button>
            )}
            {currentPhase && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${phaseColors[currentPhase] || ""}`}>
                {currentPhase} phase
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-muted)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Flow */}
          <Section title="Flow">
            <div className="grid grid-cols-4 gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFlow(option.value as any)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    flow === option.value
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:bg-[rgba(217,119,6,0.1)] dark:hover:bg-[rgba(157,124,216,0.1)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Mood */}
          <Section title="Mood">
            <div className="grid grid-cols-3 gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(mood === option.value ? "" : option.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    mood === option.value
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Symptoms */}
          <Section title="Symptoms & Severity">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map((symptom) => {
                  const isActive = symptomDetails.some(s => s.name === symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => handleSymptomToggle(symptom)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        isActive
                          ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                          : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>

              {/* Severity Scales for active symptoms */}
              <div className="space-y-3 mt-4">
                {symptomDetails.map((symptom) => (
                  <div key={symptom.name} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--text)]">{symptom.name}</span>
                      <span className="text-[10px] font-bold uppercase text-[var(--primary)]">
                        {symptom.severity <= 2 ? "Mild" : symptom.severity === 3 ? "Moderate" : "Severe"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleSeverityChange(symptom.name, level)}
                          aria-label={`Set ${symptom.name} severity to ${level}`}
                          aria-pressed={level <= symptom.severity}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            level <= symptom.severity
                              ? level >= 4 ? "bg-red-500" : level === 3 ? "bg-amber-500" : "bg-green-500"
                              : "bg-[var(--border)]"
                          }`}
                          title={`Level ${level}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Additional Symptoms */}
          <Section title="Other Symptoms">
            <input
              type="text"
              value={otherSymptoms}
              onChange={(e) => setOtherSymptoms(e.target.value)}
              placeholder="e.g., lower back pain, dizziness..."
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
            />
          </Section>

          {/* Cervical Mucus */}
          <Section title="Cervical Mucus">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {cervicalMucusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCervicalMucus(cervicalMucus === option.value ? "" : option.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    cervicalMucus === option.value
                      ? "bg-cyan-600 border-cyan-600 text-white shadow-sm"
                      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Temperature */}
          <Section title="Basal Body Temperature (°F)">
            <input
              type="number"
              step="0.1"
              min="95"
              max="105"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="98.6"
              className="w-full sm:w-40 px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
            />
          </Section>

          {/* Live Recommendations */}
          {liveRecommendations.length > 0 && (
            <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-2.5">Immediate Care Tips</p>
              <div className="space-y-3">
                {liveRecommendations.map((rec: Recommendation) => (
                  <div key={rec.id} className="flex items-start gap-3">
                    <span className="text-lg">{rec.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-[var(--text)]">{rec.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)] leading-tight">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none resize-none transition-all"
              rows={3}
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-[var(--border)] flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <RingLoader size={16} label="Saving" />
                Saving...
              </>
            ) : (
              "Save Log"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2.5">{title}</p>
      {children}
    </div>
  );
}
