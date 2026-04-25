"use client";

import { useState, useTransition } from "react";
import { updateDailyGoal } from "@/src/presentation/actions/profileActions";

interface Props {
  initialGoal: number;
}

export function DailyGoalEditor({ initialGoal }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [goal, setGoal] = useState(initialGoal.toString());

  const handleUpdate = () => {
    const newGoal = parseInt(goal);
    if (isNaN(newGoal) || newGoal < 1) {
      alert("올바른 목표 장수를 입력해주세요 (1장 이상).");
      return;
    }

    startTransition(async () => {
      const res = await updateDailyGoal(newGoal);
      if (res.success) {
        setIsEditing(false);
        // 클라이언트 측에서 즉시 새로고침하여 동기화 유도
        window.location.reload();
      } else if (res.error) {
        alert(res.error);
      }
    });
  };


  return (
    <div className="bg-[#f5f3ef] rounded-2xl p-6 border border-[#e4e2de] shadow-sm">
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-[#75777e] uppercase tracking-wider">
            하루 성경 통독 목표 수정
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 h-12 bg-white rounded-xl px-4 border border-[#c5c6ce] focus:border-[#041129] outline-none font-bold"
              min="1"
            />
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="px-6 bg-[#041129] text-white rounded-xl font-bold active:scale-95 disabled:opacity-50 transition-all"
            >
              저장
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 bg-white text-[#75777e] border border-[#c5c6ce] rounded-xl font-bold"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[#75777e] text-xs font-bold uppercase tracking-wider mb-1">나의 하루 목표</h3>
            <p className="text-[#041129] text-xl font-bold" style={{ fontFamily: "Manrope, sans-serif" }}>
              매일 <span className="text-[#775a19]">{initialGoal}장</span> 읽기
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#c5c6ce] rounded-lg text-sm font-medium text-[#45474d] hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            목표 수정
          </button>
        </div>
      )}
    </div>
  );
}
