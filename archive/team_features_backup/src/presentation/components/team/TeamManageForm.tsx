"use client";

import { useState, useTransition } from "react";
import {
  updateTeamName,
  removeMember,
  deleteTeam,
} from "@/src/presentation/actions/teamActions";

interface Member { 
  id: string; 
  name: string; 
  isMe: boolean; 
}

interface Props {
  /** 팀 고유 ID */
  teamId: string;
  /** 현재 팀 이름 */
  currentName: string;
  /** 현재 소속된 팀원 목록 */
  members: Member[];
  /** 현재 사용자가 팀장인지 여부 */
  isLeader?: boolean;
}

/**
 * 팀장 또는 팀원이 팀 정보를 관리하고 팀원 목록을 확인할 수 있는 폼 컴포넌트
 */
export function TeamManageForm({ teamId, currentName, members, isLeader = false }: Props) {
  // 팀 이름 수정 상태
  const [teamName, setTeamName] = useState(currentName);
  // 성공/에러 피드백 메시지 상태
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  // 서버 액션 실행 중 상태 관리
  const [isPending, startTransition] = useTransition();

  /**
   * 상단 피드백 메시지를 일정 시간 동안 보여줍니다.
   */
  function showMsg(type: "success" | "error", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  // ── 1. 팀 이름 저장 로직 (팀장 전용) ───────────────────────────
  function handleSaveName() {
    if (!isLeader) return;
    startTransition(async () => {
      const res = await updateTeamName(teamId, teamName);
      if (res.error) showMsg("error", res.error);
      else showMsg("success", "팀 이름이 저장되었습니다.");
    });
  }

  // ── 2. 팀원 제거 로직 (팀장 전용) ──────────────────────────────
  function handleRemove(memberId: string) {
    if (!isLeader) return;
    if (!confirm("팀에서 제거하시겠습니까?")) return;
    startTransition(async () => {
      const res = await removeMember(memberId);
      if (res.error) showMsg("error", res.error);
      // 성공 시 페이지가 자동 revalidate되어 목록이 갱신됩니다.
    });
  }

  // ── 3. 팀 삭제/해체 로직 (팀장 전용, 위험 구역) ─────────────────
  function handleDeleteTeam() {
    if (!isLeader) return;
    if (!confirm("정말로 이 팀을 해체하시겠습니까? 모든 채팅과 활동 기록이 영구적으로 삭제됩니다.")) return;
    
    // 실수 방지를 위한 2차 확인 문자열 입력
    const doubleCheck = prompt("팀을 해체하려면 '팀 삭제'라고 입력해주세요.");
    if (doubleCheck !== "팀 삭제") {
      alert("입력 내용이 일치하지 않아 취소되었습니다.");
      return;
    }

    startTransition(async () => {
      const res = await deleteTeam(teamId);
      if (res?.error) showMsg("error", res.error);
      // 성공 시 팀 목록 페이지로 자동 이동됩니다.
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 피드백 메시지 노출 (성공/에러) */}
      {msg && (
        <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${
          msg.type === "success" ? "bg-[#ffdea5] text-[#261900]" : "bg-[#ffdad6] text-[#93000a]"
        }`}
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
          <span className="material-symbols-outlined text-[18px]">
            {msg.type === "success" ? "check_circle" : "error"}
          </span>
          {msg.text}
        </div>
      )}

      {/* 2. 팀 이름 수정 섹션 */}
      <section className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(4,17,41,0.03)] border border-[#e4e2de]">
        <label className="block text-[#1b1c1a] mb-2"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
          htmlFor="team-name">
          팀 이름
        </label>
        <div className="flex gap-2">
          <input
            id="team-name"
            value={teamName}
            disabled={!isLeader} // 팀장만 수정 가능
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1 bg-[#f5f3ef] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all disabled:opacity-70"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "16px", fontWeight: 500 }}
            placeholder="팀 이름 입력"
          />
          {isLeader && (
             <button onClick={handleSaveName} disabled={isPending}
             className="bg-[#041129] text-white px-4 py-3 rounded-lg hover:bg-[#041129]/90 active:scale-95 transition-all disabled:opacity-60">
             저장
           </button>
          )}
        </div>
      </section>

      {/* 3. 현재 팀원 목록 섹션 */}
      <section className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(4,17,41,0.03)] border border-[#e4e2de] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "18px", fontWeight: 600 }}>
            현재 팀원
          </h3>
          <span className="bg-[#ffdea5] text-[#261900] px-3 py-1 rounded-full"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
            {members.length}명
          </span>
        </div>
        <ul className="flex flex-col">
          {members.map((member, i) => (
            <li key={member.id}
              className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-[#f5f3ef]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#eae8e4] flex items-center justify-center border border-[#c5c6ce] shadow-sm">
                  <span className="text-[#1b1c1a]"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "18px", fontWeight: 700 }}>
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-[#1b1c1a] flex items-center gap-1.5"
                    style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>
                    {member.name}
                    {member.isMe && (
                      <span className="text-[#775a19]"
                        style={{ fontFamily: "Manrope, sans-serif", fontSize: "10px" }}>
                        (나)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {/* 팀장인 경우 본인을 제외한 팀원 제거 버튼 노출 */}
              {isLeader && !member.isMe && (
                <button onClick={() => handleRemove(member.id)} disabled={isPending}
                  className="text-[#75777e] hover:text-[#ba1a1a] p-2 rounded-full hover:bg-[#ffdad6] transition-colors active:scale-95 duration-150">
                  <span className="material-symbols-outlined text-[20px]">person_remove</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 4. 위험 구역 (팀 삭제/해체, 팀장 전용) */}
      {isLeader && (
        <section className="mt-4 bg-[#fff1f0] rounded-xl p-6 border border-[#ffccc7] flex flex-col gap-4">
          <div>
            <h3 className="text-[#cf1322]"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "18px", fontWeight: 600 }}>
              위험 구역
            </h3>
            <p className="text-[#45474d] mt-1"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
              팀을 해체하면 복구할 수 없습니다. 신중히 결정해 주세요.
            </p>
          </div>
          <button 
            onClick={handleDeleteTeam}
            disabled={isPending}
            className="w-full bg-[#ff4d4f] text-white font-bold py-3.5 rounded-lg hover:bg-[#cf1322] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}
          >
            팀 삭제하기
          </button>
        </section>
      )}
    </div>
  );
}
