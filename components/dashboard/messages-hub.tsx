"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Star,
  MoreVertical,
  Filter,
  Archive,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
  type: 'text' | 'image' | 'file';
}

interface Conversation {
  id: string;
  inquiryId?: string; // Link to inquiry if exists
  vendorName: string;
  vendorId?: string; // Vendor/provider ID
  vendorAvatar?: string;
  vendorRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  status?: "new" | "responded" | "quoted" | "booked" | "declined"; // Inquiry status
  messages: Message[];
}

export function MessagesHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [conversations, setConversations] = useState<Conversation[]>([

    {
      id: "1",
      inquiryId: "inq-1",
      vendorId: "vendor-1",
      vendorName: "Intore Cultural Group",
      vendorRole: "Entertainment",
      lastMessage: "Thank you for choosing us! We'll send the performance details soon.",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      isOnline: true,
      status: "responded",
      messages: [
        {
          id: "1",
          sender: "Intore Cultural Group",
          senderRole: "Entertainment",
          content: "Hello! Thank you for your interest in our traditional dance services.",
          timestamp: "2024-01-15 10:30",
          isRead: true,
          type: 'text'
        },
        {
          id: "2",
          sender: "You",
          senderRole: "Customer",
          content: "Hi! We'd like to book your Intore dancers for our wedding on March 15th.",
          timestamp: "2024-01-15 10:35",
          isRead: true,
          type: 'text'
        },
        {
          id: "3",
          sender: "Intore Cultural Group",
          senderRole: "Entertainment",
          content: "That's wonderful! We have availability on March 15th. Our package includes 8 dancers, traditional costumes, and cultural music. The cost is 150,000 RWF.",
          timestamp: "2024-01-15 10:40",
          isRead: true,
          type: 'text'
        },
        {
          id: "4",
          sender: "You",
          senderRole: "Customer",
          content: "Perfect! Can you send me more details about the performance duration and setup requirements?",
          timestamp: "2024-01-15 10:45",
          isRead: true,
          type: 'text'
        },
        {
          id: "5",
          sender: "Intore Cultural Group",
          senderRole: "Entertainment",
          content: "Thank you for choosing us! We'll send the performance details soon.",
          timestamp: "2 hours ago",
          isRead: false,
          type: 'text'
        }
      ]
    },
    {
      id: "2",
      inquiryId: "inq-2",
      vendorId: "vendor-2",
      vendorName: "Kigali Serena Hotel",
      vendorRole: "Venue",
      lastMessage: "Your venue booking is confirmed for March 15th.",
      lastMessageTime: "1 day ago",
      unreadCount: 0,
      isOnline: false,
      status: "booked",
      messages: [
        {
          id: "1",
          sender: "Kigali Serena Hotel",
          senderRole: "Venue",
          content: "Your venue booking is confirmed for March 15th.",
          timestamp: "1 day ago",
          isRead: true,
          type: 'text'
        }
      ]
    },
    {
      id: "3",
      inquiryId: "inq-3",
      vendorId: "vendor-3",
      vendorName: "Rwandan Delights Catering",
      vendorRole: "Food",
      lastMessage: "We can accommodate your dietary requirements.",
      lastMessageTime: "3 days ago",
      unreadCount: 1,
      isOnline: true,
      status: "quoted",
      messages: [
        {
          id: "1",
          sender: "Rwandan Delights Catering",
          senderRole: "Food",
          content: "We can accommodate your dietary requirements.",
          timestamp: "3 days ago",
          isRead: false,
          type: 'text'
        }
      ]
    }
  ]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.vendorRole.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "unread" && conv.unreadCount > 0) ||
      (filterStatus === "online" && conv.isOnline);

    return matchesSearch && matchesFilter;
  });

  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation) {
      const now = new Date();
      const timestamp = now.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const newMsg: Message = {
        id: `${Date.now()}`,
        sender: "You",
        senderRole: "Customer",
        content: newMessage.trim(),
        timestamp,
        isRead: false,
        type: 'text'
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage.trim(),
            lastMessageTime: "Just now",
          };
        }
        return conv;
      }));
      setNewMessage("");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6 p-2">
      {/* Conversations List Container */}
      <div className="w-1/3 flex flex-col bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif italic text-slate-800">Inbound Dialogues</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Provider Communications</p>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-sage-500/20 text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {["all", "unread", "online"].map((status) => (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={`h-9 px-5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === status
                  ? "bg-sage-600 text-white shadow-lg shadow-sage-600/20"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-300 group ${selectedConversation === conversation.id
                ? "bg-sage-600 text-white shadow-2xl shadow-sage-900/20 relative z-10 scale-[1.02]"
                : "hover:bg-slate-50 text-slate-600"
                }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <Avatar className={`w-12 h-12 rounded-2xl border-2 ${selectedConversation === conversation.id ? "border-slate-700" : "border-white shadow-sm"}`}>
                    <AvatarImage src={conversation.vendorAvatar} className="object-cover" />
                    <AvatarFallback className={selectedConversation === conversation.id ? "bg-slate-700 text-white" : "bg-sage-50 text-sage-700 font-bold"}>
                      {getInitials(conversation.vendorName)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-sage-500 rounded-full border-2 border-white shadow-sm ring-2 ring-sage-500/20 transform animate-pulse"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold text-sm truncate ${selectedConversation === conversation.id ? "text-white" : "text-slate-800"}`}>
                      {conversation.vendorName}
                    </h3>
                    <span className={`text-[9px] font-bold tracking-widest uppercase ${selectedConversation === conversation.id ? "text-slate-400" : "text-slate-400"}`}>
                      {conversation.lastMessageTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest opacity-60`}>
                      {conversation.vendorRole}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-sage-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-sage-500/40">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  <p className={`text-xs truncate leading-relaxed ${selectedConversation === conversation.id ? "text-slate-300" : "text-slate-500"}`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
        {currentConversation ? (
          <>
            {/* Chat Header - Higher Visual Hierarchy */}
            <div className="p-8 border-b border-slate-50 bg-[#f8fafc]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Avatar className="w-14 h-14 rounded-2xl shadow-xl border-2 border-white">
                    <AvatarImage src={currentConversation.vendorAvatar} className="object-cover" />
                    <AvatarFallback className="bg-sage-600 text-white font-serif italic text-xl">
                      {getInitials(currentConversation.vendorName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-serif italic text-slate-800">{currentConversation.vendorName}</h3>
                      <Badge className="bg-sage-50 text-sage-700 border-none px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                        {currentConversation.vendorRole}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentConversation.isOnline ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-sage-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage-600">Active Presence</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Offline Status</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentConversation.inquiryId && (
                    <div className="hidden lg:flex flex-col items-end mr-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contextual Reference</span>
                      <span className="text-xs font-serif italic text-slate-600">Inquiry #{currentConversation.inquiryId.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100/50">
                    {[Phone, Mail, Star, MoreVertical].map((Icon, idx) => (
                      <Button key={idx} variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:bg-white hover:text-sage-600 hover:shadow-sm rounded-xl transition-all">
                        <Icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages - Boutique Bubbles */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-100">
              {currentConversation.messages.map((message, idx) => {
                const isYou = message.sender === "You";
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isYou ? "items-end text-right" : "items-start text-left"}`}
                  >
                    {!isYou && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{message.sender}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-sage-600/60">{message.senderRole}</span>
                      </div>
                    )}

                    <div
                      className={`relative group max-w-[85%] lg:max-w-[70%] p-5 shadow-sm transition-all duration-300 ${isYou
                        ? "bg-sage-600 text-white rounded-[2rem] rounded-tr-none shadow-xl shadow-sage-900/10"
                        : "bg-slate-50 text-slate-700 rounded-[2rem] rounded-tl-none border border-slate-100"
                        }`}
                    >
                      <p className="text-[13px] leading-relaxed font-medium">{message.content}</p>

                      <div className={`absolute -bottom-6 flex items-center gap-3 whitespace-nowrap ${isYou ? "right-2" : "left-2"}`}>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          {message.timestamp}
                        </span>
                        {isYou && (
                          <div className="flex items-center gap-1 opacity-40">
                            {message.isRead ? (
                              <ShieldCheck className="w-3 h-3 text-sage-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input - Precision Design */}
            <div className="p-8 border-t border-slate-50">
              <div className="relative group max-w-4xl mx-auto flex items-end gap-3 p-2 pl-4 bg-slate-50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 transition-all focus-within:bg-white focus-within:border-sage-500/30 focus-within:shadow-2xl focus-within:shadow-sage-500/5">
                <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-sage-600 mb-0.5 rounded-2xl">
                  <Paperclip className="w-5 h-5" />
                </Button>

                <Textarea
                  placeholder="Draft your response here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 min-h-[56px] max-h-[160px] resize-none bg-transparent border-none shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-300 py-4 text-sm font-medium leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />

                <div className="flex gap-2 mb-0.5">
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-sage-600 rounded-2xl">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`h-12 w-12 rounded-2xl transition-all duration-500 ${newMessage.trim()
                      ? "bg-sage-600 text-white shadow-xl shadow-sage-600/30 hover:bg-sage-700 active:scale-90"
                      : "bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <p className="text-center text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300 mt-6 pulse">Encrypted Channel Established</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30">
            <div className="max-w-sm text-center">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
                <MessageCircle className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-serif italic text-slate-800 mb-4 text-balance">Strategic Dialogue Pending</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Select a service provider from your curated portfolio to resume existing communication channels.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
