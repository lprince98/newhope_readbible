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
    <div className="card flex h-[420px] flex-col overflow-hidden">
      {/* 메시지 목록 */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="my-auto flex flex-col items-center gap-2 text-center text-[14px] text-muted">
            <span className="material-symbols-outlined text-[28px] text-silver">forum</span>
            첫 번째 응원 메시지를 보내보세요! 🙏
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === myUserId;
          const senderName = msg.profiles?.name ?? "알 수 없음";
          const initials = senderName.charAt(0);
          const timeStr = new Date(msg.created_at).toLocaleTimeString("ko-KR", {
            hour: "2-digit", minute: "2-digit",
          });

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              {/* 상대방 아바타 */}
              {!isMe && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft text-[13px] font-bold text-teal-deep">
                  {initials}
                </div>
              )}

              <div className={`flex max-w-[75%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="mb-1 ml-1 text-[12px] font-medium text-muted">{senderName}</span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2 ${
                    isMe
                      ? "rounded-br-md bg-brand text-white shadow-brand"
                      : "rounded-bl-md bg-sunken text-ink"
                  }`}
                >
                  <p className="text-[14px] leading-5 break-words whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="mx-1 mt-1 text-[11px] text-subtle">{timeStr}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="flex items-center gap-2 border-t border-line bg-card p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="응원 메시지를 보내세요..."
          maxLength={500}
          disabled={isPending}
          aria-label="응원 메시지"
          className="field min-h-11 flex-1 rounded-full bg-sunken disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          aria-label="메시지 보내기"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-brand transition-all hover:bg-brand-deep active:scale-95 disabled:opacity-40 disabled:shadow-none"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            send
          </span>
        </button>
      </div>
    </div>
  );
}
