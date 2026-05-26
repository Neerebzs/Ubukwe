"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/auth";
import {
  useConversations,
  useMessageHistory,
  useMessagesSocket,
  markConversationRead,
  type Conversation,
  type ChatMessage,
} from "@/hooks/useMessages";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, Send, Wifi, WifiOff, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function parseBackendTimestamp(raw: string) {
  // If backend sends naive timestamps, treat them as UTC and convert for display.
  const hasZone = /([zZ]|[+\-]\d{2}:\d{2})$/.test(raw);
  return new Date(hasZone ? raw : `${raw}Z`);
}

function formatTime(iso: string) {
  const d = parseBackendTimestamp(iso);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString("en-GB", { timeZone: "Africa/Kigali" });
}

function formatMessageTime(iso: string) {
  const d = parseBackendTimestamp(iso);
  const tz = "Africa/Kigali";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function getKigaliDayKey(iso: string) {
  const d = parseBackendTimestamp(iso);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function isTodayInKigali(iso: string) {
  return getKigaliDayKey(iso) === new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDateSeparator(iso: string) {
  const d = parseBackendTimestamp(iso);
  const tz = "Africa/Kigali";

  const dateKey = getKigaliDayKey(iso);
  const now = new Date();
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  if (dateKey === todayKey) {
    return "Today";
  }

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(yesterday);

  if (dateKey === yesterdayKey) {
    return "Yesterday";
  }

  const msgDate = parseBackendTimestamp(iso);
  const daysBehind = Math.floor((now.getTime() - msgDate.getTime()) / (24 * 60 * 60 * 1000));
  if (daysBehind >= 2 && daysBehind <= 4) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long",
    }).format(msgDate);
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(msgDate);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  selected,
  onClick,
}: {
  conv: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-200 border ${
        selected
          ? "bg-sage-600 text-white shadow-xl scale-[1.02] border-sage-700"
          : "bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400"
      }`}
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 rounded-2xl shrink-0">
          <AvatarImage src={conv.partner_avatar} />
          <AvatarFallback
            className={selected ? "bg-slate-700 text-white" : "bg-sage-50 text-sage-700 font-bold"}
          >
            {initials(conv.partner_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`font-bold text-sm truncate ${selected ? "text-white" : "text-slate-800"}`}>
              {conv.partner_name}
            </span>
            <span className="text-[9px] text-slate-900 shrink-0 ml-2">
              {formatTime(conv.last_message_time)}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-900">
              {conv.partner_role?.replace("_", " ")}
            </span>
            {conv.unread_count > 0 && (
              <span className="w-5 h-5 bg-sage-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${selected ? "text-white" : "text-slate-900"}`}>
            {conv.last_message}
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  return (
    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] px-5 py-4 shadow-sm ${
          isMe
            ? "bg-[#9DC183] text-black rounded-[2rem] rounded-tr-sm"
            : "bg-white text-black rounded-[2rem] rounded-tl-sm border border-slate-200"
        }`}
      >
        <p className="text-[13px] leading-relaxed font-medium text-black">{msg.message}</p>
        <div className={`flex items-center gap-1.5 mt-2 ${isMe ? "justify-end" : "justify-end"}`}>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest ${
              isMe ? "text-black/70" : "text-black/70"
            }`}
          >
            {formatMessageTime(msg.created_at)}
          </span>
          {isMe && (
            <span className="inline-flex items-center ml-0.5">
              {msg.read ? (
                // Double blue ticks
                <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                  <path d="M1 5.5L4.5 9L11 2" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 5.5L8.5 9L15 2" stroke="#2196F3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                // Single grey tick
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 5.5L4.5 8.5L9.5 2" stroke="rgba(0,0,0,0.45)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function getTokenUserId(): string | null {
  try {
    const token = tokenManager.getAccessToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.sub || null;
  } catch {
    return null;
  }
}

export function MessagesHub() {
  const { user } = useAuth();
  const currentUserId = user?.id ?? getTokenUserId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Deep-link: ?with=<userId> from the "chat unlocked" notification
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const withId = params.get("with");
    if (withId) {
      setSelectedId(withId);
      setShowChatOnMobile(true);
    }
  }, []);

  const { data: conversations = [], isLoading: convsLoading } = useConversations();
  const { data: history = [], isLoading: historyLoading } = useMessageHistory(selectedId);
  const { connected, error: wsError, sendMessage } = useMessagesSocket(selectedId);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Show WS error once
  useEffect(() => {
    if (wsError) toast.error("Messaging connection lost — retrying…");
  }, [wsError]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    markConversationRead(id);
    setShowChatOnMobile(true);
  };

  const handleSend = () => {
    if (!draft.trim() || !selectedId) return;
    const ok = sendMessage(draft.trim());
    if (ok) {
      setDraft("");
    } else {
      toast.error("Not connected yet — please wait a moment");
    }
  };

  const filtered = conversations.filter((c) =>
    c.partner_name.toLowerCase().includes(search.toLowerCase())
  );

  const current = conversations.find((c) => c.conversation_with === selectedId);

  return (
    <div className="h-[calc(100dvh-130px)] md:h-[calc(100vh-180px)] xl:h-[calc(100vh-200px)] flex gap-4 md:gap-6 overflow-hidden">

      {/* ── Sidebar ── */}
      <div className={`w-full md:w-80 shrink-0 flex-col bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-serif italic text-slate-800 mb-1">Messages</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-6">
            Provider Communications
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
            <Input
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-slate-50 border-none text-sm text-slate-900 placeholder:text-slate-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
          {convsLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-[2rem] flex gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}

          {!convsLoading && filtered.length === 0 && (
            <p className="text-center py-12 text-slate-900 text-sm">No conversations yet</p>
          )}

          {filtered.map((conv) => (
            <ConversationItem
              key={conv.conversation_with}
              conv={conv}
              selected={selectedId === conv.conversation_with}
              onClick={() => selectConversation(conv.conversation_with)}
            />
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={`w-full md:flex-1 flex-col bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden ${!showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-50">
                <MessageCircle className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-800 mb-3">
                Select a conversation
              </h3>
              <p className="text-slate-900 text-sm">
                Choose a provider from the list to start messaging.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <div className="flex items-center gap-3 md:gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden shrink-0 h-10 w-10 text-slate-500 rounded-full hover:bg-slate-100" 
                  onClick={() => setShowChatOnMobile(false)}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-2xl">
                  <AvatarImage src={current?.partner_avatar} />
                  <AvatarFallback className="bg-sage-600 text-white font-bold">
                    {current ? initials(current.partner_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif italic text-slate-800 text-base md:text-lg truncate max-w-[120px] sm:max-w-xs">
                    {current?.partner_name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                    {current?.partner_role?.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Connection indicator */}
              <Badge
                variant="outline"
                className={`gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                  connected
                    ? "border-sage-200 text-sage-600 bg-sage-50"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                {connected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {connected ? "Live" : "Connecting…"}
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {historyLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                  >
                    <Skeleton className="h-14 w-64 rounded-[2rem]" />
                  </div>
                ))}

              {!historyLoading && history.length === 0 && (
                <p className="text-center text-slate-900 text-sm py-12">
                  No messages yet — say hello!
                </p>
              )}

              {history.map((msg, index) => {
                const previous = history[index - 1];
                const currentDay = getKigaliDayKey(msg.created_at);
                const previousDay = previous ? getKigaliDayKey(previous.created_at) : null;
                const showDateSeparator = !previous || previousDay !== currentDay;

                return (
                  <div key={msg.id} className="space-y-4">
                    {showDateSeparator && (
                      <div className="flex justify-center">
                        <span className="rounded-full bg-slate-100 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 shadow-sm border border-slate-200">
                          {formatDateSeparator(msg.created_at)}
                        </span>
                      </div>
                    )}
                    <MessageBubble msg={msg} isMe={msg.sender_id === user?.id || msg.sender_id === currentUserId} />
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-50">
              <div className="flex items-end gap-3 p-2 pl-4 bg-white rounded-3xl border border-slate-300 focus-within:border-sage-600/60 focus-within:bg-white transition-all shadow-sm">
                <Textarea
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1 min-h-[48px] max-h-[140px] resize-none bg-transparent border-none shadow-none focus-visible:ring-0 text-sm text-slate-900 placeholder:text-slate-700"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!draft.trim() || !connected}
                  className={`h-12 w-12 rounded-2xl mb-0.5 transition-all shrink-0 ${
                    draft.trim() && connected
                      ? "bg-[#668c65] text-white hover:bg-sage-700 active:scale-95"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 mt-4">
                End-to-end encrypted
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
