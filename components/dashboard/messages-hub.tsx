"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { MessageCircle, Search, Send, ShieldCheck, Clock, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return d.toLocaleDateString();
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
      className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-200 ${
        selected
          ? "bg-sage-600 text-white shadow-xl scale-[1.02]"
          : "hover:bg-slate-50"
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
            <span className="text-[9px] text-slate-400 shrink-0 ml-2">
              {formatTime(conv.last_message_time)}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
              {conv.partner_role?.replace("_", " ")}
            </span>
            {conv.unread_count > 0 && (
              <span className="w-5 h-5 bg-sage-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </div>
          <p className={`text-xs truncate ${selected ? "text-slate-300" : "text-slate-500"}`}>
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
            ? "bg-sage-600 text-white rounded-[2rem] rounded-tr-sm"
            : "bg-slate-50 text-slate-700 rounded-[2rem] rounded-tl-sm border border-slate-100"
        }`}
      >
        <p className="text-[13px] leading-relaxed font-medium">{msg.message}</p>
      </div>
      <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          {formatTime(msg.created_at)}
        </span>
        {isMe && (
          msg.read
            ? <ShieldCheck className="w-3 h-3 text-sage-400" />
            : <Clock className="w-3 h-3 text-slate-300" />
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MessagesHub() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

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
    <div className="h-[calc(100vh-200px)] flex gap-6 p-2">

      {/* ── Sidebar ── */}
      <div className="w-1/3 flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-8 pb-4">
          <h2 className="text-2xl font-serif italic text-slate-800 mb-1">Messages</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">
            Provider Communications
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
            <Input
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-slate-50 border-none text-sm"
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
            <p className="text-center py-12 text-slate-400 text-sm">No conversations yet</p>
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
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-50">
                <MessageCircle className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-800 mb-3">
                Select a conversation
              </h3>
              <p className="text-slate-400 text-sm">
                Choose a provider from the list to start messaging.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-2xl">
                  <AvatarImage src={current?.partner_avatar} />
                  <AvatarFallback className="bg-sage-600 text-white font-bold">
                    {current ? initials(current.partner_name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif italic text-slate-800 text-lg">
                    {current?.partner_name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                <p className="text-center text-slate-400 text-sm py-12">
                  No messages yet — say hello!
                </p>
              )}

              {history.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={msg.sender_id === user?.id}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-50">
              <div className="flex items-end gap-3 p-2 pl-4 bg-slate-50 rounded-3xl border border-transparent focus-within:border-sage-500/30 focus-within:bg-white transition-all">
                <Textarea
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="flex-1 min-h-[48px] max-h-[140px] resize-none bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
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
                  className={`h-12 w-12 rounded-2xl mb-0.5 transition-all ${
                    draft.trim() && connected
                      ? "bg-sage-600 text-white shadow-lg hover:bg-sage-700 active:scale-95"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
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
