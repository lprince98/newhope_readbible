"use client";

import { useState } from "react";
import type { UnreadBookInfo } from "@/src/application/dto/DashboardDto";

interface UnreadChaptersListProps {
  unreadBooks: UnreadBookInfo[];
  totalUnreadChaptersCount: number;
}

export function UnreadChaptersList({
  unreadBooks,
  totalUnreadChaptersCount,
}: UnreadChaptersListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"old" | "new">("old");

  // 구약/신약 그룹화
  const oldTestamentBooks = unreadBooks.filter((b) => b.testament === "old");
  const newTestamentBooks = unreadBooks.filter((b) => b.testament === "new");

  const oldUnreadCount = oldTestamentBooks.reduce((sum, b) => sum + b.totalUnreadCount, 0);
  const newUnreadCount = newTestamentBooks.reduce((sum, b) => sum + b.totalUnreadCount, 0);

  // 미독 장 범위를 텍스트로 가독성 있게 렌더링하는 함수
  const renderRanges = (book: UnreadBookInfo) => {
    return book.unreadChapters
      .map((range) => {
        if (range.start === range.end) {
          return `${range.start}장`;
        }
        return `${range.start}~${range.end}장`;
      })
      .join(", ");
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(26,38,63,0.05)] border border-[#e4e2de] overflow-hidden transition-all duration-300">
      {/* 헤더 버튼 (클릭 시 아코디언 토글) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#fdfbf7] active:bg-[#f5f3ef] transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-[#ffdea5]/50 flex items-center justify-center text-[#785a1a]">
            <span className="material-symbols-outlined text-[22px]">find_in_page</span>
          </div>
          <div>
            <h4
              className="text-[#041129] font-bold"
              style={{ fontFamily: "Manrope, sans-serif", fontSize: "16px", fontWeight: 700 }}
            >
              읽어야 할 장 확인하기
            </h4>
            <p className="text-[#45474d] mt-0.5" style={{ fontFamily: "Noto Serif KR, serif", fontSize: "13px" }}>
              {totalUnreadChaptersCount === 0 ? (
                <span className="text-[#15803d] font-semibold">이번 완독 회차의 모든 장을 읽으셨습니다! 🎉</span>
              ) : (
                <span>전체 1,189장 중 <strong className="text-[#775a19]">{totalUnreadChaptersCount}장</strong>을 더 읽어야 합니다.</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalUnreadChaptersCount > 0 && (
            <span
              className="bg-[#775a19] text-white px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {totalUnreadChaptersCount}장 남음
            </span>
          )}
          <span className={`material-symbols-outlined text-[#775a19] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            keyboard_arrow_down
          </span>
        </div>
      </button>

      {/* 펼쳐지는 상세 영역 */}
      {isOpen && (
        <div className="border-t border-[#e4e2de] bg-[#fdfbf7] p-5">
          {totalUnreadChaptersCount === 0 ? (
            <div className="text-center py-8 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-5xl text-[#15803d]">check_circle</span>
              <p className="text-[#1b1c1a] font-bold mt-2" style={{ fontFamily: "Manrope, sans-serif" }}>
                읽어야 할 성경 장이 없습니다!
              </p>
              <p className="text-[#45474d] text-sm" style={{ fontFamily: "Noto Serif KR, serif" }}>
                훌륭하게 하나님의 말씀을 읽어 가고 계십니다.
              </p>
            </div>
          ) : (
            <div>
              {/* 구약/신약 탭 스위처 */}
              <div className="flex border-b border-[#e4e2de] mb-4">
                <button
                  onClick={() => setActiveTab("old")}
                  className={`flex-1 py-2 text-center font-bold text-sm transition-all focus:outline-none border-b-2 ${
                    activeTab === "old"
                      ? "border-[#775a19] text-[#775a19]"
                      : "border-transparent text-[#a1a1aa] hover:text-[#45474d]"
                  }`}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  구약 성경 ({oldUnreadCount}장)
                </button>
                <button
                  onClick={() => setActiveTab("new")}
                  className={`flex-1 py-2 text-center font-bold text-sm transition-all focus:outline-none border-b-2 ${
                    activeTab === "new"
                      ? "border-[#775a19] text-[#775a19]"
                      : "border-transparent text-[#a1a1aa] hover:text-[#45474d]"
                  }`}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  신약 성경 ({newUnreadCount}장)
                </button>
              </div>

              {/* 탭 내용 */}
              <div>
                {activeTab === "old" ? (
                  oldUnreadCount === 0 ? (
                    <div className="text-center py-6 text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif" }}>
                      구약 성경을 모두 읽으셨습니다! 🌳
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                      {oldTestamentBooks.map((book) => (
                        <div
                          key={book.bookId}
                          className="bg-white rounded-lg p-3 border border-[#e4e2de] flex flex-col gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#041129]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
                              {book.bookName}
                            </span>
                            <span className="text-xs bg-[#ffdea5] text-[#775a19] px-2 py-0.5 rounded-full font-medium">
                              {book.totalUnreadCount}장 남음
                            </span>
                          </div>
                          <p className="text-[#78350f] text-sm break-all font-medium mt-1" style={{ fontFamily: "Noto Serif KR, serif" }}>
                            {renderRanges(book)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                ) : newUnreadCount === 0 ? (
                  <div className="text-center py-6 text-[#45474d]" style={{ fontFamily: "Noto Serif KR, serif" }}>
                    신약 성경을 모두 읽으셨습니다! 🕊️
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {newTestamentBooks.map((book) => (
                      <div
                        key={book.bookId}
                        className="bg-white rounded-lg p-3 border border-[#e4e2de] flex flex-col gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#041129]" style={{ fontFamily: "Manrope, sans-serif", fontSize: "14px" }}>
                            {book.bookName}
                          </span>
                          <span className="text-xs bg-[#ffdea5] text-[#775a19] px-2 py-0.5 rounded-full font-medium">
                            {book.totalUnreadCount}장 남음
                          </span>
                        </div>
                        <p className="text-[#78350f] text-sm break-all font-medium mt-1" style={{ fontFamily: "Noto Serif KR, serif" }}>
                          {renderRanges(book)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
