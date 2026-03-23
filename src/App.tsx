import { Authenticated, AuthLoading, Unauthenticated, useQuery, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ParallaxBackground } from "./components/ParallaxBackground";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "./components/ThemeManager";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BackgroundAnimationProvider } from "./components/BackgroundAnimationContext";
import { AnimationToggleButton } from "./components/AnimationToggleButton";
import { AIAssistant } from "./components/AIAssistant";
import { HoneycombLoader } from "./components/HoneycombLoader";

function LoadingScreen({ darkMode, message = "Loading your dashboard..." }: { darkMode: boolean; message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg)] z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <HoneycombLoader size={48} />
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>     
      </div>
    </div>
  );
}

function AuthenticatedApp({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return <LoadingScreen darkMode={darkMode} message="Identifying user..." />;
  }

  const isShreeya = loggedInUser?.email === "metheotakj@gmail.com";

  return (
    <ParallaxBackground isDarkMode={darkMode} speed={0.6} centerContent={false} allowScroll density="medium">
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 md:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-white/20">
                <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  FlowTracker
                </h1>
                <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest">Menstrual Health</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AnimationToggleButton />
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all duration-300 active:scale-90"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707m12.728 0l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-5xl lg:max-w-6xl mx-auto">
            <Dashboard />
          </div>
        </main>
        <AIAssistant isShreeya={isShreeya} />
      </div>
    </ParallaxBackground>
  );
}

function UnauthenticatedApp({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <ParallaxBackground isDarkMode={darkMode} speed={0.8} centerContent={false} allowScroll>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 py-12">
        <div className="w-full max-w-md md:max-w-lg">
          <div className="flex flex-col items-center mb-8 md:mb-10">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/30 border-4 border-white mb-6 transform hover:rotate-6 transition-transform duration-500">
              <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-4xl font-extrabold text-[var(--text)] tracking-tight mb-2">FlowTracker</h1>
            <p className="text-[var(--text-muted)] font-medium tracking-wide">Empowering your wellness journey</p>
          </div>
          
          <div className="bg-[var(--surface)] rounded-3xl p-8 md:p-10 shadow-2xl border border-[var(--border)] backdrop-blur-md">
            <SignInForm />
          </div>
          
          <div className="mt-8 text-center flex items-center justify-center gap-3">
            <AnimationToggleButton />
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/20 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
            >
              {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
          </div>
        </div>
      </div>
    </ParallaxBackground>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (isLoading) {
    return <LoadingScreen darkMode={darkMode} message="Securing your connection..." />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider darkMode={darkMode}>
        <BackgroundAnimationProvider>
          <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200 relative">
            {isAuthenticated ? (
              <AuthenticatedApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            ) : (
              <UnauthenticatedApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            )}

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: "10px",
                  fontSize: "14px",
                },
              }}
            />
          </div>
        </BackgroundAnimationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
