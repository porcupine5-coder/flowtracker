import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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
  "Cramps", "Headache", "Bloating", "Breast tenderness",
  "Acne", "Fatigue", "Nausea", "Back pain", "Mood swings",
  "Loss of appetite", "Insomnia", "Anxiety",
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
  const updateDailyLog = useMutation(api.cycles.updateDailyLog);
  const startNewCycle = useMutation(api.cycles.startNewCycle);

  const [flow, setFlow] = useState<"none" | "light" | "medium" | "heavy" | "">("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [temperature, setTemperature] = useState<number | "">("");
  const [cervicalMucus, setCervicalMucus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dailyLog) {
      setFlow(dailyLog.flow || "");
      setSymptoms(dailyLog.symptoms || []);
      setMood(dailyLog.mood || "");
      setNotes(dailyLog.notes || "");
      setTemperature(dailyLog.temperature || "");
      setCervicalMucus(dailyLog.cervicalMucus || "");
    }
  }, [dailyLog]);

  const handleSymptomToggle = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDailyLog({
        date,
        flow: flow === "" ? undefined : (flow as any),
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        mood: mood === "" ? undefined : (mood as any),
        notes: notes || undefined,
        temperature: temperature === "" ? undefined : (temperature as number),
        cervicalMucus: cervicalMucus === "" ? undefined : (cervicalMucus as any),
      });

      if (flow && flow !== "none" && (!dailyLog?.flow || dailyLog.flow === "none")) {
        await startNewCycle({ startDate: date });
      }

      toast.success("Log saved successfully");
      onClose();
    } catch (error) {
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-[var(--surface)] w-full sm:rounded-2xl sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">Daily Log</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(date)}</p>
          </div>
          <div className="flex items-center gap-2">
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
          <Section title="Symptoms">
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    symptoms.includes(symptom)
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                      : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Log"
            )}
          </button>
        </div>
      </div>
    </div>
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
