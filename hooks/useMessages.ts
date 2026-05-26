'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api';
import { tokenManager } from '@/lib/auth';

export interface ChatMessage {
  id: string;
  provider_id: string;
  customer_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  conversation_with: string;
  partner_name: string;
  partner_email: string;
  partner_role: string;
  partner_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  message_type: string;
}

// ── Conversations (REST, poll every 20s) ──────────────────────────────────────
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await axiosInstance.get<Conversation[]>(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
      return res.data ?? [];
    },
    refetchInterval: 20_000,
  });
}

// ── Message history (REST, initial load only) ─────────────────────────────────
export function useMessageHistory(otherUserId: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ['message-history', otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      const res = await axiosInstance.get<ChatMessage[]>(
        API_ENDPOINTS.MESSAGES.CONVERSATION(otherUserId)
      );
      return res.data ?? [];
    },
    enabled: !!otherUserId,
    staleTime: Infinity, // WebSocket keeps it fresh
  });
}

// ── WebSocket real-time hook ──────────────────────────────────────────────────
export function useMessagesSocket(otherUserId: string | null) {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(true);

  const getWsUrl = useCallback(() => {
    if (!otherUserId) return null;
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000').trim();
    const wsBase = backendUrl.replace(/^http/, 'ws').replace(/\/+$/, '');
    return `${wsBase}/api/v1/messages/ws/${otherUserId}?token=${token}`;
  }, [otherUserId]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    // Append to history cache
    queryClient.setQueryData<ChatMessage[]>(
      ['message-history', otherUserId],
      (prev = []) => {
        if (prev.some(m => m.id === msg.id)) return prev; // dedupe
        return [...prev, msg];
      }
    );
    // Refresh conversations sidebar
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }, [otherUserId, queryClient]);

  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // read_receipt — mark all messages in this conversation as read
        if (data.type === 'read_receipt') {
          queryClient.setQueryData<ChatMessage[]>(
            ['message-history', otherUserId],
            (prev = []) => prev.map(m => ({ ...m, read: true }))
          );
          return;
        }
        // Regular incoming message
        appendMessage(data as ChatMessage);
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => setError('Connection error');

    ws.onclose = (e) => {
      setConnected(false);
      wsRef.current = null;
      // 4001 = auth failure — don't retry
      if (shouldReconnect.current && e.code !== 1000 && e.code !== 4001) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };
  }, [getWsUrl, appendMessage]);

  // Open/close socket when conversation changes
  useEffect(() => {
    if (!otherUserId) return;
    shouldReconnect.current = true;
    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close(1000);
      wsRef.current = null;
      setConnected(false);
    };
  }, [otherUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback((text: string, messageType = 'general') => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected');
      return false;
    }
    wsRef.current.send(JSON.stringify({ message: text, message_type: messageType }));
    return true;
  }, []);

  return { connected, error, sendMessage };
}

// ── Mark conversation read ────────────────────────────────────────────────────
export async function markConversationRead(otherUserId: string) {
  try {
    await axiosInstance.post(API_ENDPOINTS.MESSAGES.MARK_READ(otherUserId));
  } catch {
    // non-critical
  }
}
