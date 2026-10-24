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
    <div className="flex flex-col gap-4">
      {/* 1. 피드백 메시지 노출 (성공/에러) */}
      {msg && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-[14px] font-medium ${
            msg.type === "success" ? "bg-teal-soft text-teal-deep" : "bg-danger-soft text-danger"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {msg.type === "success" ? "check_circle" : "error"}
          </span>
          {msg.text}
        </div>
      )}

      {/* 2. 팀 이름 수정 섹션 */}
      <section className="card p-5">
        <label className="field-label" htmlFor="team-name">
          팀 이름
        </label>
        <div className="flex gap-2">
          <input
            id="team-name"
            value={teamName}
            disabled={!isLeader} // 팀장만 수정 가능
            onChange={(e) => setTeamName(e.target.value)}
            className="field flex-1 disabled:bg-sunken disabled:text-muted"
            placeholder="팀 이름 입력"
          />
          {isLeader && (
            <button type="button" onClick={handleSaveName} disabled={isPending} className="btn btn-primary shrink-0">
              저장
            </button>
          )}
        </div>
      </section>

      {/* 3. 현재 팀원 목록 섹션 */}
      <section className="card flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-ink">현재 팀원</h3>
          <span className="chip bg-brand-soft text-brand">{members.length}명</span>
        </div>
        <ul className="flex flex-col">
          {members.map((member, i) => (
            <li
              key={member.id}
              className={`flex min-h-14 items-center justify-between gap-3 py-2.5 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                    member.isMe ? "bg-brand text-white" : "bg-sunken text-ink-soft"
                  }`}
                >
                  {member.name.charAt(0)}
                </div>
                <p className="flex min-w-0 items-center gap-1.5 text-[15px] font-medium text-ink">
                  <span className="truncate">{member.name}</span>
                  {member.isMe && <span className="shrink-0 text-[12px] font-semibold text-brand">(나)</span>}
                </p>
              </div>
              {/* 팀장인 경우 본인을 제외한 팀원 제거 버튼 노출 */}
              {isLeader && !member.isMe && (
                <button
                  type="button"
                  onClick={() => handleRemove(member.id)}
                  disabled={isPending}
                  aria-label={`${member.name} 팀에서 제거`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-danger-soft hover:text-danger active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">person_remove</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 4. 위험 구역 (팀 삭제/해체, 팀장 전용) */}
      {isLeader && (
        <section className="mt-2 flex flex-col gap-4 rounded-[1.25rem] border border-danger/20 bg-danger-soft p-5">
          <div>
            <h3 className="flex items-center gap-1.5 text-[16px] font-bold text-danger">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              위험 구역
            </h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              팀을 해체하면 복구할 수 없습니다. 신중히 결정해 주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteTeam}
            disabled={isPending}
            className="btn w-full bg-danger text-white hover:bg-danger/90"
          >
            팀 삭제하기
          </button>
        </section>
      )}
    </div>
  );
}
