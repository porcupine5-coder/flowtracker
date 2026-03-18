import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState } from "react";
import { 
  Recommendation, 
  symptomRecommendations, 
  phaseRecommendations, 
  phaseMotivations
} from "../lib/recommendations";
import { toast } from "sonner";

export function DailyCare() {
  const recentLogs = useQuery(api.cycles.getRecentLogs);
  const today = new Date().toISOString().split("T")[0];
  const currentPhase = useQuery(api.cycles.getCurrentPhase, { date: today });
  const trackInteraction = useMutation(api.cycles.trackRecommendationInteraction);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const recommendations = useMemo(() => {
    if (!recentLogs) return [];
    
    const list: Recommendation[] = [];
    const phase = currentPhase || "follicular";
    
    // 1. Add phase-based recommendations
    if (phaseRecommendations[phase]) {
      list.push(...phaseRecommendations[phase]);
    }

    // 2. Identify patterns from last 7 days including severity
    const last7Days = recentLogs.slice(0, 7);
    const symptomStats: Record<string, { count: number, maxSeverity: number }> = {};

    last7Days.forEach(log => {
      // Handle both legacy symptoms and new symptomDetails
      if (log.symptomDetails) {
        log.symptomDetails.forEach(s => {
          if (!symptomStats[s.name]) symptomStats[s.name] = { count: 0, maxSeverity: 0 };
          symptomStats[s.name].count++;
          symptomStats[s.name].maxSeverity = Math.max(symptomStats[s.name].maxSeverity, s.severity);
        });
      } else if (log.symptoms) {
        log.symptoms.forEach(s => {
          if (!symptomStats[s]) symptomStats[s] = { count: 0, maxSeverity: 3 }; // Default moderate for legacy
          symptomStats[s].count++;
        });
      }
    });

    // Filter recommendations by severity threshold
    Object.entries(symptomStats).forEach(([name, stats]) => {
      const recs = symptomRecommendations[name] || [];
      recs.forEach(rec => {
        if (!rec.minSeverity || stats.maxSeverity >= rec.minSeverity) {
          list.push(rec);
        }
      });
    });

    // Filter out dismissed ones
    const filtered = list.filter(rec => !dismissedIds.includes(rec.id));
    
    // Deduplicate
    return Array.from(new Map(filtered.map(item => [item.id, item])).values());
  }, [currentPhase, recentLogs, dismissedIds]);

  const groupedRecommendations = useMemo(() => {
    const groups: Record<string, Recommendation[]> = {
      nutrition: [],
      exercise: [],
      "self-care": [],
      medical: []
    };
    
    recommendations.forEach(rec => {
      if (groups[rec.category]) {
        groups[rec.category].push(rec);
      } else {
        groups["self-care"].push(rec);
      }
    });

    // Sort each group by priority
    const priorityMap = { emergency: 0, high: 1, medium: 2, low: 3 };
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        (priorityMap[a.priority as keyof typeof priorityMap || "low"] || 3) - 
        (priorityMap[b.priority as keyof typeof priorityMap || "low"] || 3)
      );
    });

    return groups;
  }, [recommendations]);

  const dailyMessage = useMemo(() => {
    const phase = currentPhase || "follicular";
    const messages = phaseMotivations[phase] || [];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [currentPhase]);

  const handleAction = async (id: string, action: "like" | "dismiss") => {
    if (action === "dismiss") {
      setDismissedIds(prev => [...prev, id]);
    } else {
      setLikedIds(prev => [...prev, id]);
      toast.success("Thanks for the feedback!", { duration: 2000 });
    }
    
    try {
      await trackInteraction({ recommendationId: id, action });
    } catch (e) {
      console.error("Failed to track interaction", e);
    }
  };

  const todayLog = useMemo(() => recentLogs?.find(log => log.date === today), [recentLogs, today]);
  const emergencyDetected = todayLog?.emergencyFlag;

  if (!recommendations.length && !dailyMessage && !emergencyDetected) return null;

  const priorityColors = {
    emergency: "text-red-600 bg-red-100 dark:bg-red-900/30",
    high: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    medium: "text-[var(--primary)] bg-[var(--primary)]/10",
    low: "text-[var(--text-muted)] bg-[var(--bg)]"
  };

  return (
    <div className="mt-8 animate-fade-in space-y-8">
      {/* Emergency Alert Section */}
      {emergencyDetected && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500/50 p-6 rounded-3xl animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center text-2xl shadow-lg">
              🚨
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Health Alert Detected</h3>
              <p className="text-sm text-red-600 dark:text-red-300 leading-relaxed">
                Your logged symptoms indicate a potentially severe combination (e.g., high fever with severe pain). 
                Please consider consulting a healthcare professional immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Message Card */}
      {dailyMessage && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 p-6 rounded-3xl shadow-sm transition-all hover:shadow-md">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm border border-white/20">
              ✨
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mb-1">Daily Inspiration</p>
              <h3 className="text-base font-medium text-[var(--text)] leading-relaxed italic">
                "{dailyMessage}"
              </h3>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl -ml-12 -mb-12" />
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">Wellness Guide</h3>
            <p className="text-sm text-[var(--text-muted)]">Personalized care based on your cycle and symptoms</p>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedRecommendations).map(([category, recs]) => {
            if (recs.length === 0) return null;
            return (
              <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-[var(--border)]" />
                  {category}
                  <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full text-[10px] lowercase">
                    {recs.length} tips
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recs.map((rec) => (
                    <div 
                      key={rec.id}
                      className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl hover:shadow-xl hover:border-[var(--primary)]/30 transition-all group relative flex flex-col h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg)] flex items-center justify-center text-2xl shadow-sm border border-[var(--border)] group-hover:scale-110 transition-transform duration-300">
                          {rec.icon}
                        </div>
                        {rec.priority && rec.priority !== "low" && (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-tighter ${priorityColors[rec.priority as keyof typeof priorityColors]}`}>
                            {rec.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">{rec.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                          {rec.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-5">
                        <button 
                          onClick={() => { void handleAction(rec.id, "dismiss"); }}
                          className="text-[10px] font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1.5"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Dismiss
                        </button>
                        <button 
                          onClick={() => { void handleAction(rec.id, "like"); }}
                          disabled={likedIds.includes(rec.id)}
                          className={`text-[10px] font-bold px-4 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                            likedIds.includes(rec.id)
                              ? "bg-green-500/10 border-green-500/20 text-green-600"
                              : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5"
                          }`}
                        >
                          <svg className={`w-3.5 h-3.5 ${likedIds.includes(rec.id) ? "fill-current" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {likedIds.includes(rec.id) ? "Saved" : "Helpful"}
                        </button>
                      </div>
                      <div className="absolute -right-2 -bottom-2 w-24 h-24 bg-[var(--primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--primary)]/10 transition-colors pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
