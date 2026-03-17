import { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

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
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
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

  // Track mobile layout
  useEffect(() => {
    const updateMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
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
      const target = windowRef.current;
      if (!target || isMobile) return;
      const rect = target.getBoundingClientRect();
      const maxX = Math.max(0, window.innerWidth - rect.width);
      const maxY = Math.max(0, window.innerHeight - rect.height);
      setPosition((prev) => ({
        x: Math.min(Math.max(0, prev.x), maxX),
        y: Math.min(Math.max(0, prev.y), maxY),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const startDrag = (e: React.PointerEvent, type: "window" | "bubble" | "handle") => {
    if (isMobile && !isOpen && type === "bubble") {
      return;
    }
    const targetEl = type === "bubble" ? bubbleRef.current : windowRef.current;
    if (!targetEl) return;

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
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      e.preventDefault();

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        dragStateRef.current.moved = true;
      }

      if (isMobile && isOpen && dragStateRef.current.type === "handle") {
        setSheetDragY(Math.max(0, deltaY));
        return;
      }

      const targetEl = dragStateRef.current.type === "bubble" ? bubbleRef.current : windowRef.current;
      const rect = targetEl?.getBoundingClientRect();
      const width = rect?.width ?? (dragStateRef.current.type === "bubble" ? 52 : 360);
      const height = rect?.height ?? (dragStateRef.current.type === "bubble" ? 52 : 580);

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - width));
      const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - height));

      setPosition({ x: constrainedX, y: constrainedY });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragStateRef.current.pointerId !== e.pointerId) return;
      const didMove = dragStateRef.current.moved;
      const dragType = dragStateRef.current.type;
      setIsDragging(false);
      setIsSheetDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      if (isMobile && isOpen && dragType === "handle") {
        if (sheetDragY > 120) {
          setIsOpen(false);
        }
        setSheetDragY(0);
        return;
      }

      if (!isMobile && didMove) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      }
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: false });
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, dragOffset, isMobile, isOpen, position, sheetDragY]);

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
      handleSend();
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
          onPointerDown={(e) => startDrag(e, "bubble")}
          onClick={() => {
            if (dragStateRef.current.moved) return;
            setIsOpen(true);
          }}
          className="ai-assistant-fab ai-draggable fixed z-40 flex items-center justify-center group"
          title="Open AI Assistant"
          style={
            isMobile
              ? { bottom: "20px", right: "20px" }
              : { left: `${position.x}px`, top: `${position.y}px` }
          }
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-full transition-colors" />
          <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="ai-assistant-backdrop" aria-hidden="true" />
      )}

      {isOpen && (
        <div
          ref={windowRef}
          className={`ai-assistant-window fixed bg-[#faf8f5] border border-[var(--border)] flex flex-col overflow-hidden z-50 ${
            isDragging ? "dragging" : ""
          } ${isMobile ? "ai-assistant-sheet" : ""}`}
          style={{
            left: isMobile ? "0px" : `${position.x}px`,
            top: isMobile ? "auto" : `${position.y}px`,
            bottom: isMobile ? "0px" : "auto",
            width: isMobile ? "100vw" : "360px",
            height: isMinimized ? "56px" : isMobile ? "85vh" : "580px",
            transform: isMobile ? `translateY(${sheetDragY}px)` : "none",
            transition: isMobile && isSheetDragging ? "none" : "transform 0.25s ease",
          }}
        >
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => startDrag(e, "handle")}
            className="ai-drag-handle ai-draggable"
          >
            <span className="ai-drag-handle-pill" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3.5 border-b border-[var(--border)] flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden border border-[var(--border)]">
                <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover" />
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
                className="w-9 h-9 rounded-full hover:bg-[rgba(0,0,0,0.06)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
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
                    className="w-9 h-9 rounded-full hover:bg-[rgba(0,0,0,0.06)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
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
                      className="w-9 h-9 rounded-full hover:bg-[rgba(0,0,0,0.06)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
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
                className="w-9 h-9 rounded-full hover:bg-[rgba(0,0,0,0.06)] transition-colors text-[var(--text-muted)] flex items-center justify-center"
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
              <div className="ai-messages-container flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden border-2 border-[var(--primary)]/10">
                      <img src="/logo.jpg" alt="FlowTracker Logo" className="w-full h-full object-cover" />
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
                          ? "bg-[var(--secondary)] text-white rounded-br-sm"
                          : "bg-[var(--border)] text-[var(--text)] rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-sm">
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
              <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0 bg-[#faf8f5] sticky bottom-0">
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
                    onClick={handleSend}
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
