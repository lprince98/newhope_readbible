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
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 성경 선택 */}
      <div className="md:col-span-12 bg-[#efeeea] rounded-xl p-6 border border-[#e4e2de]">
        <label
          className="block mb-2 text-[#041129]"
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
          htmlFor="bookId"
        >
          성경
        </label>
        <div className="relative">
          <select
            id="bookId"
            name="bookId"
            required
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="w-full appearance-none bg-[#fbf9f5] text-[#1b1c1a] border border-[#c5c6ce] rounded-lg px-4 py-4 focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] outline-none transition-all cursor-pointer shadow-sm"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#75777e]">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>
      </div>

      {/* 장 범위 */}
      <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#efeeea] rounded-xl p-6 border border-[#e4e2de] flex flex-col gap-4">
          <h3
            className="text-[#041129] border-b border-[#c5c6ce] pb-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
          >
            장
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="sr-only" htmlFor="startChapter">시작 장</label>
              <input
                id="startChapter"
                name="startChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder="시작"
                required
                value={startChapter}
                onChange={(e) => setStartChapter(e.target.value)}
                className="w-full bg-[#fbf9f5] text-center text-[#1b1c1a] border border-[#c5c6ce] rounded-lg py-3 focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] outline-none transition-all shadow-inner"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
              />
            </div>
            <span className="text-[#c5c6ce]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}>—</span>
            <div className="flex-1">
              <label className="sr-only" htmlFor="endChapter">종료 장</label>
              <input
                id="endChapter"
                name="endChapter"
                type="number"
                min={1}
                max={maxChapters}
                placeholder="종료"
                required
                value={endChapter}
                onChange={(e) => setEndChapter(e.target.value)}
                className="w-full bg-[#fbf9f5] text-center text-[#1b1c1a] border border-[#c5c6ce] rounded-lg py-3 focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] outline-none transition-all shadow-inner"
                style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
              />
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div className="bg-[#efeeea] rounded-xl p-6 border border-[#e4e2de] flex flex-col gap-4">
          <h3
            className="text-[#041129] border-b border-[#c5c6ce] pb-2"
            style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px", fontWeight: 500 }}
          >
            묵상 메모 <span className="text-[#45474d] font-normal">(선택)</span>
          </h3>
          <textarea
            id="memo"
            name="memo"
            placeholder="이 말씀에서 무엇을 깨달았나요?"
            rows={3}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-[#fbf9f5] text-[#1b1c1a] border border-[#c5c6ce] rounded-lg px-4 py-3 focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] outline-none transition-all resize-y shadow-inner"
            style={{ fontFamily: "Noto Serif KR, serif", fontSize: "15px" }}
          />
        </div>
      </div>

      {/* 오류 메시지 */}
      {state?.error && (
        <div className="md:col-span-12 bg-[#ffdad6] text-[#93000a] rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {/* 성공 메시지 */}
      {state?.success && (
        <div className="md:col-span-12 bg-[#ffdea5] text-[#261900] rounded-lg px-4 py-3 text-sm">
          ✓ 읽기 기록이 {editRecord ? "수정" : "저장"}되었습니다!
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="md:col-span-12 mt-4 flex flex-col gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`w-full ${editRecord ? 'bg-[#041129]' : 'bg-[#775a19]'} text-white py-4 px-8 rounded-full flex items-center justify-center gap-2 shadow-lg hover:translate-y-[1px] active:translate-y-[2px] transition-all duration-200 disabled:opacity-60`}
          style={{ fontFamily: "Manrope, sans-serif", fontSize: "22px", fontWeight: 600 }}
        >
          <span className="material-symbols-outlined">{editRecord ? "edit_square" : "bookmark_add"}</span>
          {isPending ? "처리 중..." : editRecord ? "읽기 기록 수정" : "읽기 기록 저장"}
        </button>
        
        {editRecord && (
          <button
            type="button"
            onClick={() => router.push("/record")}
            className="w-full bg-white text-[#75777e] py-3 rounded-full border border-[#c5c6ce] text-sm font-bold"
          >
            수정 취소
          </button>
        )}
      </div>

    </form>
  );
}
