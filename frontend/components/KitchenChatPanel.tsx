"use client";

import { useEffect, useRef, useState } from "react";
import { getKitchenMessages, sendKitchenMessage, type ChatMessage } from "@/lib/profileStore";
import { tap } from "@/lib/haptics";

interface KitchenChatPanelProps {
  kitchenName: string;
  onClose: () => void;
}

export function KitchenChatPanel({ kitchenName, onClose }: KitchenChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  function scrollBottom() {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  async function load() {
    const msgs = await getKitchenMessages(undefined, 40).catch(() => []);
    // Messages come newest-first from RPC; reverse to display oldest first.
    setMessages(msgs.slice().reverse());
  }

  useEffect(() => {
    load().then(scrollBottom);
    pollRef.current = setInterval(() => {
      load().catch(() => {});
    }, 5_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    tap();
    setDraft("");
    await sendKitchenMessage(body).catch(() => {});
    await load();
    setSending(false);
  }

  function relTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60_000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h`;
  }

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "0.6rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          height: "72svh",
          background: "var(--yi-white)",
          border: "1px solid var(--yi-frame)",
          borderBottom: "none",
          display: "flex", flexDirection: "column",
          animation: "modal-in 220ms ease",
        }}
      >
        <style>{`@keyframes modal-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <div>
            <p style={{ ...mono, color: "var(--yi-muted)", margin: 0 }}>Kitchen Chat</p>
            <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--yi-ink)", margin: "3px 0 0" }}>
              {kitchenName}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--yi-frame)", padding: "6px 12px", ...mono, cursor: "pointer", color: "var(--yi-ink)" }}>
            Close
          </button>
        </div>

        {/* Message list */}
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 ? (
            <div style={{ margin: "auto", textAlign: "center", paddingBottom: 24 }}>
              <p style={{ ...mono, color: "var(--yi-muted)" }}>The Kitchen is quiet · say something, Chef</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{ display: "grid", gap: 3 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ ...mono, color: "var(--yi-ink)", fontSize: "0.62rem" }}>
                    {msg.profileIcon ?? "👤"} {msg.chefAlias}
                  </span>
                  <span style={{ ...mono, color: "var(--yi-muted)", fontSize: "0.5rem" }}>
                    {relTime(msg.createdAt)}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontSize: "0.88rem", color: "var(--yi-copy)", margin: 0, lineHeight: 1.5 }}>
                  {msg.body}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Say something at the table…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            maxLength={280}
            style={{
              flex: 1,
              padding: "13px 14px",
              border: "none",
              background: "var(--yi-soft)",
              fontFamily: "var(--font-archivo), system-ui, sans-serif",
              fontSize: "0.88rem",
              color: "var(--yi-ink)",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!draft.trim() || sending}
            style={{
              minWidth: 70,
              background: draft.trim() ? "var(--yi-black)" : "var(--yi-soft)",
              color: draft.trim() ? "var(--yi-white)" : "var(--yi-muted)",
              border: "none",
              ...mono,
              cursor: draft.trim() ? "pointer" : "default",
              transition: "all 150ms ease",
            }}
          >
            Send
          </button>
        </div>

        <p style={{ ...mono, color: "var(--yi-muted)", padding: "6px 16px", fontSize: "0.48rem", letterSpacing: "0.08em", borderTop: "1px solid var(--yi-hairline)", flexShrink: 0 }}>
          Kitchen members only · mock demo · no financial advice
        </p>
      </div>
    </div>
  );
}
