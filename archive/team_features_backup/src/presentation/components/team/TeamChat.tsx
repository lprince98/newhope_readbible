"use client"; // build trigger

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
          
          // 이미 존재하는 메시지인지 확인 (중복 방지)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;

            // 내 메시지가 실제 DB에서 도착한 경우: 임시 메시지를 실제 메시지로 교체
            if (newMsg.user_id === myUserId) {
              const tempIndex = prev.findLastIndex(m => m.id.startsWith("temp-") && m.content === newMsg.content);
              if (tempIndex !== -1) {
                const next = [...prev];
                next[tempIndex] = { ...newMsg, profiles: { name: myName } };
                return next;
              }
            }
            
            // 다른 사람의 메시지인 경우: 프로필 가져와서 추가
            // (이 부분은 아래에서 비동기로 처리하기 위해 일단 null로 추가 후 업데이트하거나, 
            //  함수 밖에서 처리해야 함. 여기서는 간결성을 위해 즉시 가져오는 로직 유지)
            return [...prev]; // 아래 fetch 이후에 업데이트됨
          });

          // 다른 사람의 메시지일 때만 프로필 조회 후 추가
          if (newMsg.user_id !== myUserId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", newMsg.user_id)
              .single();

            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, { ...newMsg, profiles: profile }];
            });
          }
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
  async function handleSend() {
    if (!input.trim() || isPending) return;
    
    const text = input.trim();
    setInput("");

    // 낙관적 업데이트: 서버 응답 전 화면에 미리 표시
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      content: text,
      created_at: new Date().toISOString(),
      user_id: myUserId,
      profiles: { name: myName }
    };
    
    setMessages((prev) => [...prev, tempMsg]);

    startTransition(async () => {
      const result = await sendMessage(teamId, text);
      if (result?.error) {
        alert(result.error);
        // 실패 시 임시 메시지 제거
        setMessages((prev) => prev.filter(m => m.id !== tempId));
      }
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
