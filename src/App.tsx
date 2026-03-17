import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ParallaxBackground } from "./components/ParallaxBackground";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeManager";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

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

  return (
    <ThemeProvider darkMode={darkMode}>
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
        <Authenticated>
          <AuthenticatedApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Authenticated>
        <Unauthenticated>
          <UnauthenticatedApp darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Unauthenticated>
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
    </ThemeProvider>
  );
}

function AuthenticatedApp({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <ParallaxBackground isDarkMode={darkMode} speed={0.6} centerContent={false} allowScroll density="low">
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--border)] h-14 flex items-center justify-between px-4 md:px-6 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border)] shadow-sm">
              <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-semibold text-[var(--text)] tracking-tight">FlowTracker</span>
          </div>
          <div className="flex items-center gap-3">
            {loggedInUser && (
              <span className="hidden sm:block text-sm text-[var(--text-muted)] truncate max-w-[180px]">
                {loggedInUser.email || loggedInUser.name}
              </span>
            )}
            <label className="theme-toggle" title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              />
              <span className="slider" />
            </label>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {loggedInUser === undefined ? (
            <LoadingScreen />
          ) : (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <Dashboard />
            </div>
          )}
        </main>
      </div>
    </ParallaxBackground>
  );
}

function UnauthenticatedApp({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) {
  return (
    <ParallaxBackground isDarkMode={darkMode} speed={0.8}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6 z-30">
            <label className="theme-toggle" title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              />
              <span className="slider" />
            </label>
          </div>
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6 shadow-xl overflow-hidden border-2 border-[var(--primary)]/20 p-1">
              <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <h1 className="text-5xl font-bold text-[var(--text)] mb-2 tracking-tight">FlowTracker</h1>
            <p className="text-base text-[var(--text-muted)] font-medium">Intelligent cycle tracking & wellness insights</p>
          </div>

          {/* Form Card */}
          <div className="bg-[var(--surface)] rounded-3xl p-8 shadow-2xl border border-[var(--border)] backdrop-blur-md">
            <SignInForm />
          </div>

          {/* Footer Message */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Your health data is <span className="font-semibold text-[var(--text)]">completely private</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </ParallaxBackground>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-400">Loading your dashboard...</p>
      </div>
    </div>
  );
}
