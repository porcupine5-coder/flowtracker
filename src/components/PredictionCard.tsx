interface PredictionCardProps {
  settings: any;
  cycles: any[];
}

export function PredictionCard({ settings, cycles }: PredictionCardProps) {
  const getPredictions = () => {
    if (!settings.lastPeriodStart) return null;
    const lastPeriodDate = new Date(settings.lastPeriodStart);
    const predictions = [];
    for (let i = 1; i <= 3; i++) {
      const nextPeriodDate = new Date(lastPeriodDate);
      nextPeriodDate.setDate(lastPeriodDate.getDate() + settings.averageCycleLength * i);
      predictions.push({
        cycle: i,
        startDate: nextPeriodDate,
        endDate: new Date(
          nextPeriodDate.getTime() + (settings.averagePeriodLength - 1) * 24 * 60 * 60 * 1000
        ),
      });
    }
    return predictions;
  };

  const predictions = getPredictions();

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getDaysUntil = (date: Date) =>
    Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm p-5">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Upcoming Periods</h3>

      {!predictions ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-muted)]">Log your first period to see predictions</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {predictions.map((prediction, index) => {
            const daysUntil = getDaysUntil(prediction.startDate);
            const isPast = daysUntil < 0;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${
                  index === 0 && !isPast
                    ? "bg-[var(--surface)] border-[var(--primary)] glow-effect"
                    : "bg-[var(--bg)] border-[var(--border)]"
                }`}
              >
                <div>
                  <p className={`text-xs font-medium mb-0.5 ${index === 0 && !isPast ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>
                    {index === 0 ? "Next period" : `Period ${index + 1}`}
                  </p>
                  <p className="text-sm text-[var(--text)]">
                    {formatDate(prediction.startDate)} – {formatDate(prediction.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${index === 0 && !isPast ? "text-[var(--primary)]" : "text-[var(--text-muted)]"}`}>
                    {isPast ? "—" : daysUntil}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{isPast ? "" : "days"}</p>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-[var(--text-muted)] pt-1">
            Predictions are estimates based on your cycle history.
          </p>
        </div>
      )}
    </div>
  );
}
