"use client";

import { useState, useTransition } from "react";
import { updateDailyGoal } from "@/src/presentation/actions/profileActions";

interface Props {
  /** 데이터베이스에서 가져온 초기 목표 장 수 */
  initialGoal: number;
}

/**
 * 사용자가 자신의 하루 성경 통독 목표를 수정할 수 있는 에디터 컴포넌트
 */
export function DailyGoalEditor({ initialGoal }: Props) {
  // 서버 액션 실행 상태 관리 (트랜지션 사용)
  const [isPending, startTransition] = useTransition();
  // 편집 모드 여부
  const [isEditing, setIsEditing] = useState(false);
  // 입력된 목표치 상태
  const [goal, setGoal] = useState(initialGoal.toString());

  /**
   * 수정된 목표를 데이터베이스에 저장합니다.
   */
  const handleUpdate = () => {
    const newGoal = parseInt(goal);

    // 유효성 검사 (숫자가 아니거나 1보다 작은 경우)
    if (isNaN(newGoal) || newGoal < 1) {
      alert("올바른 목표 장수를 입력해주세요 (1장 이상).");
      return;
    }

    startTransition(async () => {
      const res = await updateDailyGoal(newGoal);

      if (res.success) {
        setIsEditing(false);
        // [중요] 클라이언트 측에서 즉시 새로고침을 실행하여
        // 대시보드의 원형 그래프 등에 새로운 목표치가 즉각 반영되도록 합니다.
        window.location.reload();
      } else if (res.error) {
        alert(res.error);
      }
    });
  };

  return (
    <section className="rounded-[1.25rem] border border-teal/20 bg-teal-tint p-5">
      {isEditing ? (
        /* 편집 모드 UI */
        <div className="flex flex-col gap-3">
          <label className="field-label mb-0" htmlFor="dailyGoalInput">
            하루 성경 통독 목표 수정
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="dailyGoalInput"
                type="number"
                inputMode="numeric"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="field pr-10 text-[17px] font-bold"
                min="1"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[14px] text-subtle">
                장
              </span>
            </div>
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="btn btn-teal px-5"
            >
              {isPending ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-secondary px-4"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        /* 표시 모드 UI */
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal text-white">
              <span className="material-symbols-outlined text-[22px]">flag</span>
            </div>
            <div>
              <h3 className="eyebrow mb-0.5">나의 하루 목표</h3>
              <p className="text-[18px] font-bold text-ink">
                매일 <span className="text-teal-deep">{initialGoal}장</span> 읽기
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary shrink-0 px-4 text-[14px]"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            목표 수정
          </button>
        </div>
      )}
    </section>
  );
}
