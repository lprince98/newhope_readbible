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
    <div className="flex items-center gap-1">
      {/* 수정 버튼: URL 파라미터를 통해 폼으로 전달 */}
      <Link
        href={`?id=${recordId}`}
        className="p-2 text-[#75777e] hover:text-[#775a19] hover:bg-[#f5f3ef] rounded-lg transition-colors"
        title="수정"
      >
        <span className="material-symbols-outlined text-[18px]">edit_note</span>
      </Link>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-2 text-[#75777e] hover:text-[#ba1a1a] hover:bg-[#fdf2f2] rounded-lg transition-colors disabled:opacity-50"
        title="삭제"
      >
        <span className="material-symbols-outlined text-[18px]">
          {isPending ? "progress_activity" : "delete"}
        </span>
      </button>
    </div>
  );
}

