import { useEffect, useMemo, useState } from "react";

interface TypewriterWelcomeProps {
  userEmail?: string | null;
  userName?: string | null;
  className?: string;
}

const DEFAULT_WELCOME_TEXT = "Welcome back, Gorgeous";
const SPECIAL_WELCOME_TEXT = "Welcome back , My adorable sweetheart\u{1F493}";
const SPECIAL_EMAIL = "metheotakj@gmail.com";
const SESSION_KEY_PREFIX = "flow:typewriter-welcome:v2:done:";

function isSpecialUser(userEmail?: string | null, userName?: string | null): boolean {
  const normalizedEmail = (userEmail || "").trim().toLowerCase();
  const normalizedName = (userName || "").trim().toLowerCase();
  return normalizedEmail === SPECIAL_EMAIL || normalizedName === "shreeya";
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function safeSessionGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode / strict browser policies).
  }
}

export function TypewriterWelcome({ userEmail, userName, className }: TypewriterWelcomeProps) {
  const targetText = useMemo(
    () => (isSpecialUser(userEmail, userName) ? SPECIAL_WELCOME_TEXT : DEFAULT_WELCOME_TEXT),
    [userEmail, userName]
  );

  const sessionKey = useMemo(
    () => `${SESSION_KEY_PREFIX}${(userEmail || "guest").trim().toLowerCase()}`,
    [userEmail]
  );

  const [typedText, setTypedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const alreadyPlayed = safeSessionGet(sessionKey) === "1";

    if (alreadyPlayed || prefersReducedMotion()) {
      setTypedText(targetText);
      setIsComplete(true);
      safeSessionSet(sessionKey, "1");
      return;
    }

    setTypedText("");
    setIsComplete(false);
    let index = 0;

    const typeNext = () => {
      index += 1;
      setTypedText(targetText.slice(0, index));

      if (index >= targetText.length) {
        setIsComplete(true);
        safeSessionSet(sessionKey, "1");
        return;
      }

      const delay = 100 + Math.floor(Math.random() * 51);
      timeoutId = setTimeout(typeNext, delay);
    };

    // Start immediately on load.
    typeNext();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionKey, targetText]);

  return (
    <h1
      className={className}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={targetText}
    >
      <span aria-hidden="true">{typedText || targetText.slice(0, 1)}</span>
      {!isComplete && <span aria-hidden="true" className="typewriter-cursor">|</span>}
    </h1>
  );
}

