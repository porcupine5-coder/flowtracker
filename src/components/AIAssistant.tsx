import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import BlueskyIcon from "./BlueskyIcon";


interface AIAssistantProps {
  isShreeya: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface BotConfig {
  name: string;
  description: string;
  systemPrompt: string;
  accentColor: string;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "flowAssistantPosition";

const DEFAULT_BOT: BotConfig = {
  name: "Flow Assistant",
  description: "Your personal wellness companion",
  systemPrompt: "You are a helpful, knowledgeable wellness assistant specializing in menstrual health, cycle tracking, and general wellbeing. Be concise, empathetic, and evidence-based. Provide practical advice and always recommend consulting a healthcare provider for medical concerns.",
  accentColor: "amber",
};

export function AIAssistant({ isShreeya }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [botConfig, setBotConfig] = useState<BotConfig>(DEFAULT_BOT);
  const [draftConfig, setDraftConfig] = useState<BotConfig>(DEFAULT_BOT);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [_dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const askAgent = useAction(api.aiAgent.askAgent);
  const dragStateRef = useRef<{
    pointerId: number | null;
    type: "window" | "bubble" | "handle";
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  }>({
    pointerId: null,
    type: "window",
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    moved: false,
  });

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isCompact = isMobile || isTablet;

  // Track layout
  useEffect(() => {
    let layoutTimer: number;
    const updateLayout = () => {
      window.clearTimeout(layoutTimer);
      layoutTimer = window.setTimeout(() => {
        const width = window.innerWidth;
        setIsMobile(width <= 480);
        setIsTablet(width > 480 && width <= 1024);
      }, 50);
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => {
      window.removeEventListener("resize", updateLayout);
      window.clearTimeout(layoutTimer);
    };
  }, []);

  // Initialize position to bottom right or localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Position;
        setPosition({
          x: Math.max(0, Math.min(parsed.x, window.innerWidth - 360)),
          y: Math.max(0, Math.min(parsed.y, window.innerHeight - 580)),
        });
        return;
      } catch {
        // fall through to default
      }
    }
    setPosition({
      x: window.innerWidth - 400,
      y: window.innerHeight - 640,
    });
  }, []);

  // Keep position in viewport on resize
  useEffect(() => {
    const handleResize = () => {
      if (isCompact) return;
      const target = windowRef.current;
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const maxX = Math.max(0, window.innerWidth - rect.width);
      const maxY = Math.max(0, window.innerHeight - rect.height);
      
      setPosition((prev) => ({
        x: Math.min(Math.max(0, prev.x), maxX),
        y: Math.min(Math.max(0, prev.y), maxY),
      }));
    };
    
    let resizeTimer: number;
    const debouncedResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      window.clearTimeout(resizeTimer);
    };
  }, [isCompact]);

  const startDrag = (e: React.PointerEvent, type: "window" | "bubble" | "handle") => {
    // Disable dragging on mobile/tablet for the bubble and handle
    if (isCompact && (type === "bubble" || type === "handle")) {
      return;
    }
    
    const targetEl = type === "bubble" ? bubbleRef.current : windowRef.current;
    if (!targetEl) return;

    // Use setPointerCapture to ensure we keep receiving events even if the pointer leaves the element
    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture:", err);
    }

    const rect = targetEl.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: e.pointerId,
      type,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    setIsDragging(true);
    
    if (isMobile && isOpen && type === "handle") {
      setIsSheetDragging(true);
    }
    
    document.body.style.userSelect = "none";
    document.body.style.touchAction = "none"; // Prevent scrolling while dragging
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      
      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;
      
      // Threshold to distinguish between a tap and a drag
      if (!dragStateRef.current.moved && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
        dragStateRef.current.moved = true;
      }

      if (!dragStateRef.current.moved) return;

      if (isMobile && isOpen && dragStateRef.current.type === "handle") {
        setSheetDragY(Math.max(0, deltaY));
        return;
      }

      const targetEl = dragStateRef.current.type === "bubble" ? bubbleRef.current : windowRef.current;
      if (!targetEl) return;

      const rect = targetEl.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const newX = e.clientX - dragStateRef.current.offsetX;
      const newY = e.clientY - dragStateRef.current.offsetY;

      // Robust bounds checking
      const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - width));
      const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - height));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      
      const dragType = dragStateRef.current.type;
      const didMove = dragStateRef.current.moved;
      
      setIsDragging(false);
      setIsSheetDragging(false);
      
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
      document.body.style.cursor = "";

      if (isMobile && isOpen && dragType === "handle") {
        if (sheetDragY > 120) {
          setIsOpen(false);
        }
        setSheetDragY(0);
      }

      if (!isCompact && didMove) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      }
      
      dragStateRef.current.pointerId = null;
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      
      setIsDragging(false);
      setIsSheetDragging(false);
      setSheetDragY(0);
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
      document.body.style.cursor = "";
      dragStateRef.current.pointerId = null;
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [isDragging, isMobile, isCompact, isOpen, position, sheetDragY]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await askAgent({
        question: userMessage,
        userEmail: loggedInUser?.email || "",
        botName: botConfig.name,
        systemPrompt: botConfig.systemPrompt,
        isShreeya,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      toast.error("Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleSaveConfig = () => {
    setBotConfig(draftConfig);
    setShowConfig(false);
    setMessages([]);
    toast.success(`Assistant updated to "${draftConfig.name}"`);
  };

  return (
    <>
      {/* FAB Button - Show only when window is closed */}
      {!isOpen && (
        <button
          ref={bubbleRef}
          onPointerDown={isCompact ? undefined : (e) => startDrag(e, "bubble")}
          onClick={() => {
            if (dragStateRef.current.moved) return;
            setIsOpen(true);
          }}
          className={`ai-assistant-fab fixed z-40 flex items-center justify-center group ${
            isCompact ? "" : "ai-draggable"
          } ${isDragging && dragStateRef.current.type === "bubble" ? "dragging" : ""}`}
          title="Open AI Assistant"
          style={
            isCompact
              ? { bottom: "20px", right: "20px", touchAction: "manipulation" }
              : { left: `${position.x}px`, top: `${position.y}px`, touchAction: "none" }
          }
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-full transition-colors" />
          <BlueskyIcon 
            size={24} 
            color="white" 
            className="relative z-10 transition-transform group-hover:scale-110" 
            strokeWidth={1.5}
          />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="ai-assistant-backdrop" aria-hidden="true" />
      )}

      {isOpen && (
        <div
          ref={windowRef}
          className={`ai-assistant-window fixed bg-[var(--surface)] border border-[var(--border-strong)] flex flex-col overflow-hidden z-50 ${
            isDragging ? "dragging" : ""
          } ${isMobile ? "ai-assistant-sheet" : ""}`}
          style={{
            left: isMobile ? "0px" : isTablet ? "auto" : `${position.x}px`,
            right: isTablet ? "24px" : "auto",
            top: isMobile ? "auto" : isTablet ? "auto" : `${position.y}px`,
            bottom: isMobile ? "0px" : isTablet ? "24px" : "auto",
            width: isMobile ? "100vw" : isTablet ? "min(480px, 92vw)" : "360px",
            height: isMinimized ? "56px" : isMobile ? "85vh" : isTablet ? "70vh" : "580px",
            transform: isMobile ? `translateY(${sheetDragY}px)` : "none",
            transition: isMobile && isSheetDragging ? "none" : "transform 0.25s ease",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Drag Handle */}
          <div
            onPointerDown={isTablet ? undefined : (e) => startDrag(e, "handle")}
            className={`ai-drag-handle ${isTablet ? "" : "ai-draggable"}`}
          >
            <span className="ai-drag-handle-pill" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3.5 border-b border-[var(--border)] flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-[var(--bg)] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden border border-[var(--border)] text-[var(--primary)]">
                <BlueskyIcon size={20} />
              </div>
              {!isMinimized && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{botConfig.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{botConfig.description}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-9 h-9 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8v8m0 0l4-4m-4 4l-4-4m16 0v8m0 0l-4-4m4 4l4-4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v8m0 0l-4-4m4 4l4-4M4 20v-8m0 0l4 4m-4-4l-4 4" />
                  </svg>
                )}
              </button>
              {!isMinimized && (
                <>
                  <button
                    onClick={() => { setDraftConfig(botConfig); setShowConfig(true); }}
                    className="w-9 h-9 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
                    title="Customize assistant"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="w-9 h-9 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
                      title="Clear chat"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-[var(--border)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="ai-messages-container flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--surface)]">
                {!messages.length && (
                  <div className="ai-empty-state flex flex-col items-center justify-center h-full text-center py-8 relative overflow-hidden">
                    <div className="ai-empty-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="w-16 h-16 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden border-2 border-[var(--primary)]/10 text-[var(--primary)]">
                      <BlueskyIcon size={40} />
                    </div>
                    <p className="text-base font-semibold text-[var(--text)] mb-1">{botConfig.name}</p>
                    <p className="text-sm text-[var(--text-muted)] max-w-xs">{botConfig.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {["What phase am I in?", "Tips for cramps", "Explain my cycle"].map((q) => (
                        <button
                          key={q}
                          onClick={() => setInput(q)}
                          className="ai-suggestion-pill"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[var(--primary)] text-white rounded-br-sm shadow-md"
                          : "bg-[var(--bg)] text-[var(--text)] rounded-bl-sm border border-[var(--border)] shadow-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--bg)] px-4 py-3 rounded-2xl rounded-bl-sm border border-[var(--border)]">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0 bg-[var(--surface)] sticky bottom-0">
                <div className="flex gap-2 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    disabled={isLoading}
                    className="ai-chat-input flex-1 outline-none resize-none transition-all disabled:opacity-60"
                    style={{ maxHeight: "100px" }}
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="ai-send-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Config Panel Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-[var(--surface)] w-full sm:rounded-2xl sm:max-w-md shadow-2xl flex flex-col rounded-t-2xl overflow-hidden max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="text-base font-semibold text-[var(--text)]">Customize Assistant</h2>
              <button
                onClick={() => setShowConfig(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--border)] transition-colors text-[var(--text-muted)]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Assistant Name
                </label>
                <input
                  type="text"
                  value={draftConfig.name}
                  onChange={(e) => setDraftConfig({ ...draftConfig, name: e.target.value })}
                  placeholder="e.g. Flow Assistant"
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={draftConfig.description}
                  onChange={(e) => setDraftConfig({ ...draftConfig, description: e.target.value })}
                  placeholder="e.g. Your personal wellness companion"
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Personality & Instructions
                </label>
                <textarea
                  value={draftConfig.systemPrompt}
                  onChange={(e) => setDraftConfig({ ...draftConfig, systemPrompt: e.target.value })}
                  placeholder="Describe how the assistant should behave..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] outline-none resize-none transition-all"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Define the assistant's personality, tone, and areas of expertise.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {Object.entries({
                    amber: "bg-amber-600",
                    violet: "bg-violet-600",
                    red: "bg-red-600",
                    cyan: "bg-cyan-600",
                    rose: "bg-rose-600",
                  }).map(([color, cls]) => (
                    <button
                      key={color}
                      onClick={() => setDraftConfig({ ...draftConfig, accentColor: color })}
                      className={`w-8 h-8 rounded-full ${cls} transition-all ${
                        draftConfig.accentColor === color ? "ring-2 ring-offset-2 ring-[var(--border-strong)] scale-110" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      name: "Wellness Coach",
                      description: "Health & cycle expert",
                      systemPrompt: "You are a supportive wellness coach specializing in menstrual health and cycle tracking. Provide evidence-based advice, be empathetic, and always recommend consulting healthcare providers for medical concerns. Keep responses concise and actionable.",
                      accentColor: "cyan",
                    },
                    {
                      name: "Study Buddy",
                      description: "Academic assistant",
                      systemPrompt: "You are a knowledgeable academic assistant who can help with math, science, and other subjects. Explain concepts clearly with step-by-step breakdowns. Be encouraging and patient.",
                      accentColor: "amber",
                    },
                    {
                      name: "Mindfulness Guide",
                      description: "Mental wellness support",
                      systemPrompt: "You are a calm, supportive mindfulness guide focused on mental wellness, stress management, and emotional support. Offer practical techniques for relaxation, meditation, and emotional regulation. Be gentle and non-judgmental.",
                      accentColor: "violet",
                    },
                    {
                      name: "Nutrition Advisor",
                      description: "Diet & nutrition tips",
                      systemPrompt: "You are a nutrition advisor who provides practical dietary advice tailored to menstrual health and overall wellbeing. Suggest foods that support hormonal balance and energy levels. Always recommend consulting a dietitian for personalized plans.",
                      accentColor: "rose",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setDraftConfig(preset)}
                      className="p-3 text-left border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[rgba(217,119,6,0.1)] dark:hover:bg-[rgba(157,124,216,0.1)] transition-all"
                    >
                      <p className="text-sm font-medium text-[var(--text)]">{preset.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => setShowConfig(false)}
                className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
