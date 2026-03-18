import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState } from "react";
import { 
  Recommendation, 
  symptomRecommendations, 
  phaseRecommendations, 
  moodRecommendations,
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

    // 2. Identify patterns from last 7 days
    const last7Days = recentLogs.slice(0, 7);
    const symptomFrequency: Record<string, number> = {};
    const moodFrequency: Record<string, number> = {};

    last7Days.forEach(log => {
      log.symptoms?.forEach(s => {
        symptomFrequency[s] = (symptomFrequency[s] || 0) + 1;
      });
      if (log.mood) {
        moodFrequency[log.mood] = (moodFrequency[log.mood] || 0) + 1;
      }
    });

    // Add recommendations for symptoms seen at least twice or in today's log
    Object.entries(symptomFrequency).forEach(([symptom, count]) => {
      const isToday = last7Days[0]?.date === today && last7Days[0]?.symptoms?.includes(symptom);
      if ((count >= 2 || isToday) && symptomRecommendations[symptom]) {
        list.push(...symptomRecommendations[symptom]);
      }
    });

    // Add recommendations for moods seen at least twice or in today's log
    Object.entries(moodFrequency).forEach(([mood, count]) => {
      const isToday = last7Days[0]?.date === today && last7Days[0]?.mood === mood;
      if ((count >= 2 || isToday) && moodRecommendations[mood]) {
        list.push(...moodRecommendations[mood]);
      }
    });

    // Filter out dismissed ones and shuffle
    const filtered = list.filter(rec => !dismissedIds.includes(rec.id));
    
    // Shuffle and pick 3 unique ones
    const unique = Array.from(new Map(filtered.map(item => [item.id, item])).values());
    return unique.sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [currentPhase, recentLogs, dismissedIds, today]);

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

  if (!recommendations.length && !dailyMessage) return null;

  return (
    <div className="mt-8 animate-fade-in space-y-6">
      {/* Daily Message Card */}
      {dailyMessage && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 p-6 rounded-3xl">
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
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-2xl -ml-12 -mb-12" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">Personalized Recommendations</h3>
            <p className="text-xs text-[var(--text-muted)]">Tailored for your {currentPhase || "current"} phase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div 
              key={rec.id}
              onMouseEnter={() => void trackInteraction({ recommendationId: rec.id, action: "view" })}
              className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl hover:shadow-xl hover:border-[var(--primary)]/30 transition-all group relative flex flex-col h-full"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg)] flex items-center justify-center text-xl shadow-sm border border-[var(--border)] group-hover:scale-110 transition-transform">
                  {rec.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mb-0.5">{rec.category}</p>
                  <h4 className="text-sm font-bold text-[var(--text)] mb-1 truncate">{rec.title}</h4>
                </div>
              </div>
              
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4 flex-1">
                {rec.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
                <button 
                  onClick={() => { void handleAction(rec.id, "dismiss"); }}
                  className="text-[10px] font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Dismiss
                </button>
                <button 
                  onClick={() => { void handleAction(rec.id, "like"); }}
                  disabled={likedIds.includes(rec.id)}
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1 ${
                    likedIds.includes(rec.id)
                      ? "bg-green-500/10 border-green-500/20 text-green-600"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  <svg className={`w-3 h-3 ${likedIds.includes(rec.id) ? "fill-current" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likedIds.includes(rec.id) ? "Liked" : "Helpful"}
                </button>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-[var(--primary)]/5 rounded-full blur-2xl group-hover:bg-[var(--primary)]/10 transition-colors pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
