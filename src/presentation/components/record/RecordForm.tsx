"use client";

import { BIBLE_BOOKS } from "@/lib/constants/bible-books";
import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { addReadingRecord, updateReadingRecord } from "@/src/presentation/actions/recordActions";


const initialState = { error: undefined as string | undefined, success: false };

interface Props {
  editRecord?: any;
}

export function RecordForm({ editRecord }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = editRecord
        ? await updateReadingRecord(editRecord.id, formData)
        : await addReadingRecord(formData);

      if (result.success && editRecord) {
        // 수정 완료 후 URL 파라미터 제거 (기본 모드로 복구)
        router.push("/record");
      }
      return result as typeof initialState;
    },
    initialState,
  );

  const [selectedBook, setSelectedBook] = useState(editRecord?.book_id ?? "");
  const [startChapter, setStartChapter] = useState(editRecord?.start_chapter?.toString() ?? "");
  const [endChapter, setEndChapter] = useState(editRecord?.end_chapter?.toString() ?? "");
  const [memo, setMemo] = useState(editRecord?.memo ?? "");

  // 수정 대상이 바뀌면 폼 값 업데이트
  useEffect(() => {
    if (editRecord) {
      setSelectedBook(editRecord.book_id);
      setStartChapter(editRecord.start_chapter.toString());
      setEndChapter(editRecord.end_chapter.toString());
      setMemo(editRecord.memo ?? "");
    } else {
      setSelectedBook("");
      setStartChapter("");
      setEndChapter("");
      setMemo("");
    }
  }, [editRecord]);

  const maxChapters =
    BIBLE_BOOKS.find((b) => b.id === selectedBook)?.chapters ?? 999;


  return (
    <form
      action={formAction}
      className={`card flex flex-col gap-5 p-5 md:p-6 ${editRecord ? "ring-2 ring-brand/30" : ""}`}
    >
      {editRecord && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-tint px-3 py-2 text-[13px] font-semibold text-brand">
          <span className="material-symbols-outlined text-[18px]">edit_square</span>
          기존 기록을 수정하고 있습니다
        </div>
      )}

      {/* 성경 선택 */}
      <div>
        <label className="field-label" htmlFor="bookId">
          성경
        </label>
        <div className="relative">
          <select
            id="bookId"
            name="bookId"
            required
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="field h-14 cursor-pointer appearance-none pr-12 text-[17px] font-semibold"
          >
            <option value="">성경 선택</option>
            <optgroup label="── 구약 ──">
              {BIBLE_BOOKS.filter((b) => b.testament === "old").map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.chapters}장)
                </option>
              ))}
            </optgroup>
            <optgroup label="── 신약 ──">
              {BIBLE_BOOKS.filter((b) => b.testament === "new").map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.chapters}장)
                </option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-subtle">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      {/* 장 범위 */}
      <div>
        <span className="field-label">장</span>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="sr-only" htmlFor="startChapter">시작 장</label>
            <input
              id="startChapter"
              name="startChapter"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxChapters}
              placeholder="시작"
              required
              value={startChapter}
              onChange={(e) => setStartChapter(e.target.value)}
              className="field h-14 text-center text-[20px] font-semibold"
            />
          </div>
          <span className="text-[15px] font-medium text-silver">—</span>
          <div className="flex-1">
            <label className="sr-only" htmlFor="endChapter">종료 장</label>
            <input
              id="endChapter"
              name="endChapter"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxChapters}
              placeholder="종료"
              required
              value={endChapter}
              onChange={(e) => setEndChapter(e.target.value)}
              className="field h-14 text-center text-[20px] font-semibold"
            />
          </div>
        </div>
        {selectedBook && maxChapters !== 999 && (
          <p className="mt-2 text-[12px] text-subtle">이 책은 총 {maxChapters}장입니다.</p>
        )}
      </div>

      {/* 메모 */}
      <div>
        <label className="field-label" htmlFor="memo">
          묵상 메모 <span className="font-normal text-subtle">(선택)</span>
        </label>
        <textarea
          id="memo"
          name="memo"
          placeholder="이 말씀에서 무엇을 깨달았나요?"
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="field resize-y leading-relaxed"
        />
      </div>

      {/* 오류 메시지 */}
      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl bg-danger-soft px-4 py-3 text-[14px] text-danger">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {state.error}
        </div>
      )}

      {/* 성공 메시지 */}
      {state?.success && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-soft px-4 py-3 text-[14px] font-medium text-teal-deep">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          읽기 기록이 {editRecord ? "수정" : "저장"}되었습니다!
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary h-14 w-full text-[16px]"
        >
          <span className="material-symbols-outlined">
            {isPending ? "progress_activity" : editRecord ? "edit_square" : "bookmark_add"}
          </span>
          {isPending ? "처리 중..." : editRecord ? "읽기 기록 수정" : "읽기 기록 저장"}
        </button>

        {editRecord && (
          <button
            type="button"
            onClick={() => router.push("/record")}
            className="btn btn-secondary w-full"
          >
            수정 취소
          </button>
        )}
      </div>

    </form>
  );
}
