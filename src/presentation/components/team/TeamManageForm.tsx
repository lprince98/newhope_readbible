"use client";

import { useState, useTransition } from "react";
import {
  updateTeamName,
  inviteMember,
  removeMember,
  cancelInvitation,
  deleteTeam,
} from "@/src/presentation/actions/teamActions";

interface Member { id: string; name: string; isMe: boolean }
interface Invitation { id: string; invited_email: string }

interface Props {
  teamId: string;
  currentName: string;
  members: Member[];
  invitations: Invitation[];
  isLeader?: boolean;
}

export function TeamManageForm({ teamId, currentName, members, invitations, isLeader = false }: Props) {
  const [teamName, setTeamName] = useState(currentName);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function showMsg(type: "success" | "error", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  // ── 팀 이름 저장 ─────────────────────────────────────────────
  function handleSaveName() {
    if (!isLeader) return;
    startTransition(async () => {
      const res = await updateTeamName(teamId, teamName);
      if (res.error) showMsg("error", res.error);
      else showMsg("success", "팀 이름이 저장되었습니다.");
    });
  }

  // ── 팀원 초대 ────────────────────────────────────────────────
  async function handleInvite(formData: FormData) {
    if (!isLeader) return;
    startTransition(async () => {
      const res = await inviteMember(formData);
      if (res.error) showMsg("error", res.error);
      else showMsg("success", res.message ?? "초대했습니다.");
    });
  }

  // ── 팀원 제거 ────────────────────────────────────────────────
  function handleRemove(memberId: string) {
    if (!isLeader) return;
    if (!confirm("팀에서 제거하시겠습니까?")) return;
    startTransition(async () => {
      const res = await removeMember(memberId);
      if (res.error) showMsg("error", res.error);
    });
  }

  // ── 초대 취소 ────────────────────────────────────────────────
  function handleCancelInvite(invId: string) {
    if (!isLeader) return;
    startTransition(async () => {
      const res = await cancelInvitation(invId);
      if (res.error) showMsg("error", res.error);
      else showMsg("success", "초대를 취소했습니다.");
    });
  }

  // ── 팀 삭제 (팀 해체) ─────────────────────────────────────────
  function handleDeleteTeam() {
    if (!isLeader) return;
    if (!confirm("정말로 이 팀을 해체하시겠습니까? 모든 채팅과 활동 기록이 영구적으로 삭제됩니다.")) return;
    
    const doubleCheck = prompt("팀을 해체하려면 '팀 삭제'라고 입력해주세요.");
    if (doubleCheck !== "팀 삭제") {
      alert("입력 내용이 일치하지 않아 취소되었습니다.");
      return;
    }

    startTransition(async () => {
      const res = await deleteTeam(teamId);
      if (res?.error) showMsg("error", res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 피드백 메시지 */}
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

      {/* 팀 이름 섹션 */}
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
            disabled={!isLeader}
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

      {/* 팀원 초대 섹션 */}
      <section className={`bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(4,17,41,0.03)] border border-[#e4e2de] flex flex-col gap-4 ${!isLeader ? "opacity-60 grayscale-[0.5]" : ""}`}>
        <div>
          <h3 className="text-[#041129]"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "18px", fontWeight: 600 }}>
            팀원 초대
          </h3>
          <p className="text-[#45474d] mt-1"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
            이메일로 새로운 팀원을 초대합니다. {!isLeader && "(팀장 전용)"}
          </p>
        </div>
        {isLeader && (
          <form action={handleInvite} className="flex gap-2">
            <input
              name="email"
              type="email"
              placeholder="이메일 주소 입력"
              className="flex-1 bg-[#f5f3ef] border border-[#c5c6ce] rounded-lg px-4 py-3 text-[#1b1c1a] outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}
            />
            <button type="submit" disabled={isPending}
              className="bg-[#041129] text-white font-medium px-5 py-3 rounded-lg hover:bg-[#041129]/90 transition-colors shadow-sm active:scale-95 duration-150 disabled:opacity-60"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
              초대
            </button>
          </form>
        )}

        {/* 대기 중인 초대 */}
        {invitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[#45474d]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "12px" }}>
              수락 대기 중
            </p>
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-t border-[#f5f3ef]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#efeeea] flex items-center justify-center text-[#45474d] border border-[#c5c6ce]">
                    <span className="material-symbols-outlined text-[16px]">mail</span>
                  </div>
                  <div>
                    <p className="text-[#1b1c1a]"
                      style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
                      {inv.invited_email}
                    </p>
                  </div>
                </div>
                {isLeader && (
                  <button onClick={() => handleCancelInvite(inv.id)} disabled={isPending}
                    className="text-[#75777e] hover:text-[#ba1a1a] p-2 rounded-full hover:bg-[#ffdad6] transition-colors active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 현재 팀원 섹션 */}
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

      {/* 위험 구역 (팀 삭제) */}
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


