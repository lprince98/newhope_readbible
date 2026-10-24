"use client";

import Link from "next/link";

import { useTransition } from "react";
import { deleteReadingRecord } from "@/src/presentation/actions/recordActions";

interface Props {
  recordId: string;
}

export function RecordItemAction({ recordId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("이 읽기 기록을 삭제하시겠습니까?\n삭제된 데이터는 팀 통계 및 랭킹에 즉시 반영됩니다.")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteReadingRecord(recordId);
      if (res?.error) {
        alert(res.error);
      }
    });
  };

  return (
    <div className="flex items-center">
      {/* 수정 버튼: URL 파라미터를 통해 폼으로 전달 */}
      <Link
        href={`?id=${recordId}`}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-brand-tint hover:text-brand"
        title="수정"
        aria-label="수정"
      >
        <span className="material-symbols-outlined text-[20px]">edit_note</span>
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-subtle transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
        title="삭제"
        aria-label="삭제"
      >
        <span className={`material-symbols-outlined text-[20px] ${isPending ? "animate-spin" : ""}`}>
          {isPending ? "progress_activity" : "delete"}
        </span>
      </button>
    </div>
  );
}
