import { useState } from "react";
import { getPeriodDay, getPhaseForDate as calcPhaseForDate } from "../lib/calendarUtils";

interface CalendarProps {
  onDateSelect: (date: string) => void;
  logs: any[];
  cycles: any[];
  userSettings: any;
}

export function Calendar({ onDateSelect, logs, cycles, userSettings }: CalendarProps) {
  const [viewMode, setViewMode] = useState<"month" | "year">(() => {
    const saved = localStorage.getItem("calendarViewMode");
    return (saved as "month" | "year") || "month";
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleViewModeChange = (mode: "month" | "year") => {
    setViewMode(mode);
    localStorage.setItem("calendarViewMode", mode);
  };

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getPhaseForDate = (dateString: string) =>
    calcPhaseForDate(dateString, userSettings);

  const getPeriodDays = (dateString: string) =>
    getPeriodDay(dateString, cycles || [], userSettings?.averagePeriodLength || 5);

  const getLogForDate = (dateString: string) => logs.find((log) => log.date === dateString);

  // Monthly View Helpers
  const renderMonthlyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    const calendarMode = userSettings?.calendarMode || "full";
    const isBorderMode = calendarMode === "border";

    const phaseStyles: Record<string, { bg: string, border: string, text: string, ring: string }> = {
      menstrual: {
        bg: isBorderMode ? "bg-transparent" : "bg-rose-300/20 dark:bg-rose-900/30",
        border: isBorderMode ? "border-rose-400 border-2" : "border-rose-300 dark:border-rose-700",
        text: "text-rose-700 dark:text-rose-300 font-bold",
        ring: isBorderMode ? "ring-rose-400/10" : ""
      },
      follicular: {
        bg: isBorderMode ? "bg-transparent" : "bg-amber-300/20 dark:bg-amber-900/25",
        border: isBorderMode ? "border-amber-400 border-2 shadow-[0_0_8px_rgba(217,119,6,0.14)]" : "border-amber-300 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-300 font-bold",
        ring: isBorderMode ? "ring-amber-400/10" : ""
      },
      ovulation: {
        bg: isBorderMode ? "bg-transparent" : "bg-emerald-300/22 dark:bg-emerald-900/30",
        border: "border-emerald-400 border-2 shadow-[0_0_10px_rgba(16,185,129,0.18)]",
        text: "text-emerald-700 dark:text-emerald-300 font-extrabold",
        ring: "ring-emerald-400/20 ring-2"
      },
      luteal: {
        bg: isBorderMode ? "bg-transparent" : "bg-violet-300/15 dark:bg-violet-900/28",
        border: isBorderMode ? "border-violet-400 border-2" : "border-violet-300 dark:border-violet-700",
        text: "text-violet-700 dark:text-violet-300 font-bold",
        ring: isBorderMode ? "ring-violet-400/10" : ""
      },
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(year, month, day).toISOString().split("T")[0];
      const log = getLogForDate(dateString);
      const isToday = dateString === todayString;
      const isFuture = new Date(dateString) > today;
      const isSelected = selectedDate === dateString;
      const phase = getPhaseForDate(dateString);
      const periodDay = getPeriodDays(dateString);
      const isPeriod = periodDay > 0;

      let bgClass = "";
      let textClass = "text-[var(--text)]";
      let borderClass = "rounded-2xl border border-transparent";
      let animClass = "";
      let shadowClass = "";
      const tooltipText = phase ? `${phase} phase` : "";

        if (isPeriod) {
          if (log?.flow && log.flow !== "none") {
            bgClass = isBorderMode
              ? "bg-transparent shadow-lg scale-105 z-10"
              : "bg-gradient-to-br from-rose-600 to-rose-500 shadow-lg scale-105 z-10";
            textClass = isBorderMode ? "text-rose-700 dark:text-rose-300 font-black" : "text-white font-black";
            borderClass = isBorderMode ? "border-rose-500 border-2" : "border-rose-400 border-2";
            shadowClass = "shadow-rose-500/35";
          } else {
            bgClass = isBorderMode ? "bg-transparent" : "bg-rose-300/20 dark:bg-rose-900/30";
            borderClass = "border-rose-400 border-2";
            textClass = "text-rose-700 dark:text-rose-300 font-heavy";
            shadowClass = "shadow-[0_0_8px_rgba(244,63,94,0.16)]";
          }
        const blobShapes = ["rounded-[35%_65%_30%_70%]", "rounded-[60%_40%_70%_30%]", "rounded-[40%_60%_60%_40%]"];
        borderClass += " " + blobShapes[periodDay % blobShapes.length];
      } else if (isSelected) {
        bgClass = isBorderMode ? "bg-transparent shadow-xl scale-110 z-10" : "bg-[var(--primary)] shadow-xl scale-110 z-10";
        textClass = isBorderMode ? "text-[var(--primary)] font-bold" : "text-[var(--primary-content)] font-bold";
        borderClass = isBorderMode
          ? "rounded-2xl border-[var(--primary)] border-2"
          : "rounded-2xl border-white/20 border-2";
      } else if (phase && phaseStyles[phase]) {
        const style = phaseStyles[phase];
        bgClass = style.bg;
        borderClass = "rounded-2xl " + style.border;
        textClass = style.text;
        if (style.ring) borderClass += " " + style.ring;
        if (phase === "ovulation") animClass = "animate-ring-pulse";
      }

      if (isToday) {
        borderClass += " ring-2 ring-[var(--primary)] ring-offset-2 dark:ring-offset-[var(--bg)] shadow-inner";
        animClass += " animate-breathe";
      }

      if (isFuture && !isToday && !isSelected && !isPeriod && phase !== "ovulation") {
        textClass = "text-[var(--text-muted)] p-[2px]";
      }

      days.push(
        <button
          key={day}
          onClick={() => {
            setSelectedDate(dateString);
            onDateSelect(dateString);
          }}
          title={tooltipText}
          aria-label={`${monthNames[month]} ${day}, ${year}${phase ? `, ${phase} phase` : ""}${isPeriod ? ", period day" : ""}`}
          className={`relative aspect-square flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95 group ${bgClass} ${textClass} ${borderClass} ${animClass} ${shadowClass}`}
        >
          <span className="relative z-10">{day}</span>
          
          {/* Tooltip implementation for mobile/desktop */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
            {tooltipText || `Day ${day}`}
          </div>

          <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 hover:ring-2 hover:ring-offset-1 hover:ring-[var(--primary)]/50" />
        </button>
      );
    }

    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {days}
        </div>
      </div>
    );
  };

  // Yearly View Helpers
  const renderYearlyView = () => {
    const year = currentDate.getFullYear();
    const months = [];

    const calendarMode = userSettings?.calendarMode || "full";
    const isBorderMode = calendarMode === "border";

    for (let m = 0; m < 12; m++) {
      const firstDayOfMonth = new Date(year, m, 1);
      const daysInMonth = new Date(year, m + 1, 0).getDate();
      const firstDayOfWeek = firstDayOfMonth.getDay();

      const days = [];
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(<div key={`empty-${m}-${i}`} className="w-full aspect-square" />);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = new Date(year, m, day).toISOString().split("T")[0];
        const isPeriod = getPeriodDays(dateString) > 0;
        const phase = getPhaseForDate(dateString);
        const isOvulation = phase === "ovulation";
        const isToday = dateString === todayString;

        let bgClass = "bg-transparent";
        let textClass = "text-[var(--text)]";
        let borderClass = "border-transparent";

        if (isPeriod) {
          const log = logs.find(l => l.date === dateString);
          if (log?.flow && log.flow !== "none") {
            bgClass = isBorderMode ? "bg-transparent shadow-[0_0_8px_rgba(244,63,94,0.28)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.28)]";
            textClass = isBorderMode ? "text-rose-700 dark:text-rose-300 scale-110" : "text-white scale-110";
            borderClass = "border-rose-600 border-[1.5px]";
          } else {
            bgClass = isBorderMode ? "bg-transparent" : "bg-rose-200 dark:bg-rose-900/45";
            textClass = "text-rose-700 dark:text-rose-300";
            borderClass = "border-rose-500 border-[1.5px] shadow-sm";
          }
        } else if (isOvulation) {
          bgClass = isBorderMode ? "bg-transparent" : "bg-emerald-200 dark:bg-emerald-900/30";
          textClass = "text-emerald-700 dark:text-emerald-300 font-black";
          borderClass = "border-emerald-400 border-[1.5px] shadow-[0_0_8px_rgba(16,185,129,0.18)]";
        } else if (isToday) {
          bgClass = isBorderMode ? "bg-transparent" : "bg-[var(--primary)]";
          textClass = isBorderMode ? "text-[var(--primary)]" : "text-[var(--primary-content)]";
          borderClass = isBorderMode
            ? "border-[var(--primary)] border ring-1 ring-[var(--primary)] ring-offset-1 dark:ring-offset-0 scale-110"
            : "border-white/40 border ring-1 ring-[var(--primary)] ring-offset-1 dark:ring-offset-0 scale-110";
        } else if (phase === "menstrual") {
          bgClass = isBorderMode ? "bg-transparent" : "bg-rose-200 dark:bg-rose-900/30";
          textClass = "text-rose-700 dark:text-rose-300 font-bold";
          borderClass = "border-rose-400 border-[1.5px]";
        } else if (phase === "follicular") {
          bgClass = isBorderMode ? "bg-transparent" : "bg-amber-200 dark:bg-amber-900/30";
          textClass = "text-amber-700 dark:text-amber-300 font-bold";
          borderClass = "border-amber-400 border-[1.5px]";
        } else if (phase === "luteal") {
          bgClass = isBorderMode ? "bg-transparent" : "bg-violet-200 dark:bg-violet-900/30";
          textClass = "text-violet-700 dark:text-violet-300";
          borderClass = "border-violet-400 border-[1.5px]";
        }

        days.push(
          <div key={day} className="w-full aspect-square flex items-center justify-center p-[0.5px]">
            <div className={`w-full h-full flex items-center justify-center rounded-full text-[7px] font-bold ${bgClass} ${textClass} ${borderClass} transition-all duration-300`}>
              {day}
            </div>
          </div>
        );
      }

      months.push(
        <button
          key={m}
          onClick={() => {
            setCurrentDate(new Date(year, m, 1));
            setViewMode("month");
          }}
          className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300 group text-left"
        >
          <h3 className="text-sm font-bold text-[var(--text)] mb-2 group-hover:text-[var(--primary)] transition-colors">
            {monthNames[m]}
          </h3>
          <div className="grid grid-cols-7 gap-[1px] mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-[7px] font-black text-[var(--text-muted)] text-center opacity-50 uppercase">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[1px]">
            {days}
          </div>
        </button>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        {months}
      </div>
    );
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-md p-4 md:p-7 hover:shadow-lg transition-all duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)] tracking-tight">
            {viewMode === "month" ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : currentDate.getFullYear()}
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] shadow-inner">
            <button
              onClick={() => handleViewModeChange("month")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                viewMode === "month" 
                ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleViewModeChange("year")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                viewMode === "year" 
                ? "bg-[var(--surface)] text-[var(--primary)] shadow-sm" 
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (viewMode === "month") {
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
              } else {
                setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
              }
            }}
            aria-label="Previous Month/Year"
            className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--primary)] hover:scale-110 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              setCurrentDate(new Date());
              if (viewMode === "month") setSelectedDate(todayString);
            }}
            aria-label="Go to Today"
            className="px-5 py-2 text-xs font-bold text-[var(--primary-content)] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:shadow-lg rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
          >
            Today
          </button>
          
          <button
            onClick={() => {
              if (viewMode === "month") {
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
              } else {
                setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
              }
            }}
            aria-label="Next Month/Year"
            className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200 text-[var(--text-muted)] hover:text-[var(--primary)] hover:scale-110 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative overflow-visible min-h-[300px] px-1 py-1">
        {viewMode === "month" ? renderMonthlyView() : renderYearlyView()}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-[var(--border)]">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4 px-1">Phase Legend</h4>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-4 h-4 rounded-lg bg-rose-300 border border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.18)] transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Menstrual</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-4 h-4 rounded-lg bg-amber-200 border-2 border-amber-400 shadow-[0_0_7px_rgba(217,119,6,0.14)] transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Follicular</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-4 h-4 rounded-lg bg-emerald-200 border-2 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.16)] ring-1 ring-emerald-400/35 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Ovulation</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-4 h-4 rounded-lg bg-violet-200 border-2 border-violet-400 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">Luteal</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-4 h-4 rounded-full bg-[var(--surface)] ring-2 ring-[var(--primary)] ring-offset-1 shadow-md transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
