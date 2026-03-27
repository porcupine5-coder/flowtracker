import { useEffect, useState } from "react";

interface PorcupineAnimationProps {
  isPenguine: boolean;
}

export function PorcupineAnimation({ isPenguine }: PorcupineAnimationProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    "🦔 Mr. Porcupine greets Her Majesty! 👑",
    "✨ Your loyal companion is here! ✨",
    "🌸 Ready to assist you, Your Majesty! 🌸",
    "💖 At your service, beautiful Queen! 💖"
  ];

  useEffect(() => {
    if (!isPenguine) return;

    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPenguine]);

  useEffect(() => {
    if (!showGreeting) return;

    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showGreeting, messages.length]);

  if (!isPenguine || !showGreeting) return null;

  return (
    <div className="fixed top-20 right-4 z-30 animate-bounce">
      <div className="relative">
        {/* Porcupine Character */}
        <div className="text-6xl animate-pulse">
          🦔
        </div>
        
        {/* Speech Bubble */}
        <div className="absolute -left-48 top-2 bg-[var(--surface)] border-2 border-[var(--primary)] rounded-2xl p-3 shadow-lg max-w-xs transition-all duration-500 glow-effect">
          <div className="text-sm font-medium text-[var(--text)] text-center">
            {messages[currentMessage]}
          </div>
          {/* Speech bubble tail */}
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
            <div className="w-0 h-0 border-l-8 border-l-[var(--primary)] border-t-4 border-t-transparent border-b-4 border-b-transparent transition-all duration-500"></div>
            <div className="absolute -left-1 top-0 w-0 h-0 border-l-6 border-l-[var(--surface)] border-t-3 border-t-transparent border-b-3 border-b-transparent transition-all duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
