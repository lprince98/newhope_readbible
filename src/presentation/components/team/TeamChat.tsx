"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/src/infrastructure/supabase/client";
import { sendMessage } from "@/src/presentation/actions/teamActions";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: { name: string } | null;
}

interface Props {
  teamId: string;
  myUserId: string;
  myName: string;
  initialMessages: Message[];
}

export function TeamChat({ teamId, myUserId, myName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // ── Realtime 구독 ─────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`team-chat-${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_messages",
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          const newMsg = payload.new as { id: string; content: string; created_at: string; user_id: string };
          // 발신자 이름 가져오기
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", newMsg.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, profiles: profile },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, supabase]);

  // ── 스크롤 자동 이동 ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 메시지 전송 ─────────────────────────────────────────────────
  function handleSend() {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    startTransition(async () => {
      await sendMessage(teamId, text);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="bg-white rounded-xl border border-[#e4e2de] shadow-[0_4px_24px_rgba(4,17,41,0.04)] flex flex-col"
      style={{ height: "360px" }}
    >
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-center text-[#75777e] my-auto"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
            첫 번째 응원 메시지를 보내보세요! 🙏
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === myUserId;
          const senderName = msg.profiles?.name ?? "알 수 없음";
          const initials = senderName.charAt(0);
          const timeStr = new Date(msg.created_at).toLocaleTimeString("ko-KR", {
            hour: "2-digit", minute: "2-digit",
          });

          return (
            <div key={msg.id} className={`flex gap-2 items-end ${isMe ? "justify-end" : "justify-start"}`}>
              {/* 상대방 아바타 */}
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-[#efeeea] flex items-center justify-center flex-shrink-0 border border-[#c5c6ce]">
                  <span className="text-[#1b1c1a]"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "13px", fontWeight: 600 }}>
                    {initials}
                  </span>
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                {!isMe && (
                  <span className="text-[#45474d] mb-1 ml-1"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "11px" }}>
                    {senderName}
                  </span>
                )}
                <div className={`px-3 py-2 rounded-2xl ${
                  isMe
                    ? "bg-[#fed488] text-[#785a1a] rounded-br-none shadow-[0_2px_8px_rgba(119,90,25,0.15)]"
                    : "bg-[#f5f3ef] text-[#1b1c1a] rounded-bl-none border border-[#e4e2de]"
                }`}>
                  <p style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", lineHeight: "20px" }}>
                    {msg.content}
                  </p>
                </div>
                <span className="text-[#75777e] mt-1 mx-1"
                  style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px" }}>
                  {timeStr}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-[#e4e2de] p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="응원 메시지를 보내세요..."
          maxLength={500}
          disabled={isPending}
          className="flex-1 bg-[#efeeea] rounded-full px-4 py-2 outline-none border border-transparent focus:border-[#c5c6ce] transition-colors text-[#1b1c1a] disabled:opacity-60"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}
        />
        <button
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          className="w-10 h-10 rounded-full bg-[#041129] text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-[#041129]/90 active:scale-95 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </div>
  );
}
