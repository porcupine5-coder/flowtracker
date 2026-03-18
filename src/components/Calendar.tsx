import { useState } from "react";

interface CalendarProps {
  onDateSelect: (date: string) => void;
  logs: any[];
  cycles: any[];
}

export function Calendar({ onDateSelect, logs, cycles }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const previousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateString = (day: number) =>
    new Date(year, month, day).toISOString().split("T")[0];

  const getLogForDate = (dateString: string) =>
    logs.find((log) => log.date === dateString);

  const todayString = today.toISOString().split("T")[0];

  // Get fertile window and period dates from cycles
  const getFertileWindow = (dateString: string) => {
    if (!cycles || cycles.length === 0) return false;
    
    for (const cycle of cycles) {
      if (cycle.ovulationDate) {
        const ovulationDate = new Date(cycle.ovulationDate);
        const checkDate = new Date(dateString);
        const daysDiff = Math.floor((checkDate.getTime() - ovulationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Fertile window: 5 days before and after ovulation
        if (daysDiff >= -5 && daysDiff <= 5) {
          return true;
        }
      }
    }
    return false;
  };

  const getPeriodDays = (dateString: string) => {
    if (!cycles || cycles.length === 0) return 0;
    
    for (const cycle of cycles) {
      const startDate = new Date(cycle.startDate);
      const checkDate = new Date(dateString);
      const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Period is typically first 5 days of cycle
      if (daysDiff >= 0 && daysDiff < 5) {
        return daysDiff + 1;
      }
    }
    return 0;
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = getDateString(day);
      const log = getLogForDate(dateString);
      const isToday = dateString === todayString;
      const isFuture = new Date(dateString) > today;
      const isSelected = selectedDate === dateString;
      const isFertile = getFertileWindow(dateString);
      const periodDay = getPeriodDays(dateString);
      const isPeriod = periodDay > 0;

      let bgClass = "";
      let textClass = "text-[var(--text)]";
      let borderClass = "";
      let animClass = "";

      // Period - filled blob shape with gradient
      if (isPeriod && log?.flow && log.flow !== "none") {
        switch (log.flow) {
          case "light":
            bgClass = "bg-gradient-to-br from-red-400 to-red-300 dark:from-red-500 dark:to-red-600";
            textClass = "text-white dark:text-white font-semibold";
            break;
          case "medium":
            bgClass = "bg-gradient-to-br from-red-500 to-red-400 dark:from-red-600 dark:to-red-500";
            textClass = "text-white dark:text-white font-semibold";
            break;
          case "heavy":
            bgClass = "bg-gradient-to-br from-red-600 to-red-500 dark:from-red-700 dark:to-red-600";
            textClass = "text-white dark:text-white font-semibold";
            break;
        }
        // Blob shape variation
        const blobShapes = ["rounded-[35%_65%_30%_70%]", "rounded-[60%_40%_70%_30%]", "rounded-[40%_60%_60%_40%]"];
        borderClass = blobShapes[periodDay % blobShapes.length];
      }
      // Selected date - gradient fill
      else if (isSelected) {
        bgClass = "bg-[var(--primary)] shadow-lg";
        textClass = "text-white font-semibold";
        borderClass = "rounded-2xl";
      }
      // Fertile window - soft ring outline
      else if (isFertile) {
        bgClass = "bg-[var(--accent)] opacity-80";
        textClass = "text-[var(--text)] font-medium";
        borderClass = "rounded-2xl ring-2 ring-[var(--primary)]";
        animClass = "animate-ring-pulse";
      }
      // Today - glowing dot animation
      else if (isToday) {
        bgClass = "bg-[var(--surface)]";
        textClass = "text-[var(--primary)] font-bold";
        borderClass = "rounded-2xl ring-2 ring-[var(--primary)]";
        animClass = "animate-breathe";
      }
      // Symptoms/mood logged
      else if (log?.symptoms?.length || log?.mood) {
        bgClass = "bg-[var(--secondary)] opacity-30";
        textClass = "text-[var(--text)]";
        borderClass = "rounded-2xl";
      }
      // Default
      else {
        borderClass = "rounded-2xl";
      }

      if (isFuture && !isToday && !isSelected) textClass = "text-[var(--text-muted)]";

      const handleDateSelect = (dateStr: string) => {
        setSelectedDate(dateStr);
        onDateSelect(dateStr);
      };

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(dateString)}
          className={`
            relative aspect-square flex flex-col items-center justify-center text-sm font-medium
            transition-all duration-200 cursor-pointer
            hover:scale-110 hover:shadow-md active:scale-95
            ${bgClass}
            ${textClass}
            ${borderClass}
            ${animClass}
          `}
          title={isToday ? "Today" : isFertile ? "Fertile window" : isPeriod ? "Period" : ""}
        >
          <span className="relative z-10">{day}</span>
          {/* Hover effect pulse ring */}
          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 hover:ring-2 hover:ring-offset-1 hover:ring-blue-400/50 dark:hover:ring-purple-400/50" />
        </button>
      );
    }

    return days;
  };

  return (
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-md p-6 md:p-7 hover:shadow-lg transition-all duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-7">
          <h2 className="text-xl md:text-2xl font-bold text-[var(--primary)] transition-colors duration-500">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-[var(--border)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text)] hover:scale-110 active:scale-95"
            title="Previous month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(todayString);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 dark:from-purple-500 dark:to-purple-600 hover:shadow-md rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            title="Go to today"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-[var(--border)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--text)] hover:scale-110 active:scale-95"
            title="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-red-400 to-red-500 dark:from-red-500 dark:to-red-600" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-300 dark:ring-emerald-600" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Fertile window</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-300 dark:ring-amber-600 animate-breathe" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-purple-50 dark:bg-purple-900/20" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Logged</span>
        </div>
      </div>
    </div>
  );
}
