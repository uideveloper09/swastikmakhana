"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { apiChat, type ChatMessage } from "@/lib/chat-api";
import { BRAND } from "@/lib/brand";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    `Namaste! I'm Swastik AI — your makhana shopping assistant. Ask me about products, prices, health benefits, recipes, shipping, or orders.`,
};

const DEFAULT_SUGGESTIONS = [
  "Show bestsellers",
  "Health benefits",
  "Shipping & delivery",
  "Track my order",
];

function renderMessageText(text: string) {
  const parts = text.split(/(\/p\/[a-z0-9-]+|\/makhana(?:\/[a-z0-9-]+)*|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("/p/") || part.startsWith("/makhana")) {
      return (
        <a key={i} href={part} className="chat-link font-semibold underline underline-offset-2">
          {part}
        </a>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-theme">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function LiveChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageContext = useMemo(() => {
    const match = pathname.match(/^\/p\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [open, messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    const result = await apiChat(trimmed, messages, pageContext);
    setLoading(false);

    if (result.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      setSuggestions(result.suggestions.length > 0 ? result.suggestions : DEFAULT_SUGGESTIONS);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `${result.error}\n\nYou can also WhatsApp us at ${BRAND.phone}.`,
        },
      ]);
      setSuggestions(DEFAULT_SUGGESTIONS);
    }
  };

  return (
    <div className="live-chat-root">
      {open && (
        <div className="live-chat-panel" role="dialog" aria-label="Swastik AI chat support">
          <header className="live-chat-header">
            <div className="flex items-center gap-2.5">
              <span className="live-chat-avatar">S</span>
              <div>
                <p className="text-sm font-bold text-white">Swastik AI</p>
                <p className="text-[10px] text-white/70">Product support · Online</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="live-chat-close"
              aria-label="Close chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div ref={listRef} className="live-chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`live-chat-bubble ${msg.role === "user" ? "live-chat-bubble-user" : "live-chat-bubble-bot"}`}
              >
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                  {renderMessageText(msg.content)}
                </p>
              </div>
            ))}
            {loading && (
              <div className="live-chat-bubble live-chat-bubble-bot">
                <div className="live-chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && !loading && (
            <div className="live-chat-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="live-chat-chip"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="live-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about makhana, orders, shipping…"
              className="live-chat-input"
              disabled={loading}
              maxLength={500}
            />
            <button type="submit" className="live-chat-send" disabled={loading || !input.trim()} aria-label="Send">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`live-chat-fab ${open ? "live-chat-fab-open" : ""}`}
        aria-label={open ? "Close chat support" : "Open chat support"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.25c0 5.385 4.365 9.75 9.75 9.75h.375a9.75 9.75 0 009.75-9.75V8.25a9.75 9.75 0 00-9.75-9.75h-.375A9.75 9.75 0 003.375 8.25v8.625z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
