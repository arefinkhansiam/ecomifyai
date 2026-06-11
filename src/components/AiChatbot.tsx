import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2, GripVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, useDragControls } from "framer-motion";

const STORAGE_KEY = "ecomify_help_chat_v1";

function loadInitial(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "How do I add try-on to my Shopify store?",
  "How do I get the QR code for a product?",
  "What's included in the Growth plan?",
  "How do I customize the button color?",
];

export function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initial] = useState<UIMessage[]>(() => loadInitial());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status, setMessages } = useChat({
    id: "ecomify-help",
    messages: initial,
    transport,
    onError: (e) => console.error("chat error", e),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, status]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const busy = status === "submitted" || status === "streaming";

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    await sendMessage({ text: t });
  };

  const reset = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open help chat"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full grid place-items-center text-white transition-transform hover:scale-105"
        style={{
          background: "linear-gradient(135deg,#0369A1 0%,#0EA5E9 50%,#38BDF8 100%)",
          boxShadow: "0 18px 40px -10px rgba(14,165,233,0.55), 0 0 0 4px rgba(14,165,233,0.18)",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[60] w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] rounded-2xl overflow-hidden flex flex-col"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", boxShadow: "0 30px 80px -20px rgba(2,132,199,0.45)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2.5" style={{ background: "linear-gradient(135deg,#0B1220 0%,#0369A1 60%,#0EA5E9 100%)", color: "#fff" }}>
            <span className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.18)" }}>
              <Sparkles size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold leading-tight">Ecomify Assistant</div>
              <div className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.75)" }}>AI · usually replies instantly</div>
            </div>
            {messages.length > 0 && (
              <button onClick={reset} className="text-[10.5px] font-semibold px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.12)" }}>
                Reset
              </button>
            )}
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: "#F8FAFC" }}>
            {messages.length === 0 && (
              <div>
                <div className="rounded-xl p-3 text-[12.5px] leading-relaxed" style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#0B1220" }}>
                  Hi! I'm here to help you with Ecomify — setup, embedding, analytics, billing, anything. Pick a question or type your own.
                </div>
                <div className="mt-3 grid gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left text-[11.5px] px-3 py-2 rounded-lg transition" style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#0369A1" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed"
                    style={
                      isUser
                        ? { background: "linear-gradient(135deg,#0369A1,#38BDF8)", color: "#fff", borderBottomRightRadius: 4 }
                        : { background: "#fff", border: "1px solid #E2E8F0", color: "#0B1220", borderBottomLeftRadius: 4 }
                    }
                  >
                    {isUser ? text : <div className="prose prose-sm max-w-none"><ReactMarkdown>{text || "…"}</ReactMarkdown></div>}
                  </div>
                </div>
              );
            })}

            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 text-[12px] flex items-center gap-2" style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#64748B" }}>
                  <Loader2 size={12} className="animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 p-2.5"
            style={{ background: "#fff", borderTop: "1px solid #E2E8F0" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: "#F1F5F9", color: "#0B1220" }}
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="w-9 h-9 rounded-lg grid place-items-center text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#0369A1,#38BDF8)" }}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
