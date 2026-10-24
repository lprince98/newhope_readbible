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

  // 책별 미독 카드 목록
  const renderBookGrid = (books: UnreadBookInfo[]) => (
    <div className="grid max-h-[350px] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
      {books.map((book) => (
        <div
          key={book.bookId}
          className="flex flex-col gap-1 rounded-xl border border-line bg-card p-3.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-ink">
              {book.bookName}
            </span>
            <span className="chip bg-brand-soft text-brand">
              {book.totalUnreadCount}장 남음
            </span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed break-all text-muted">
            {renderRanges(book)}
          </p>
        </div>
      ))}
    </div>
  );

  const tabClass = (tab: "old" | "new") =>
    `flex min-h-11 flex-1 items-center justify-center rounded-lg text-[14px] font-semibold transition-colors ${
      activeTab === tab
        ? "bg-card text-brand shadow-card"
        : "text-muted hover:text-ink"
    }`;

  return (
    <section className="card overflow-hidden">
      {/* 헤더 버튼 (클릭 시 아코디언 토글) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-brand-tint active:bg-sunken"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <span className="material-symbols-outlined text-[22px]">find_in_page</span>
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-ink">
              읽어야 할 장 확인하기
            </h4>
            <p className="mt-0.5 text-[13px] text-muted">
              {totalUnreadChaptersCount === 0 ? (
                <span className="font-semibold text-teal-deep">이번 완독 회차의 모든 장을 읽으셨습니다! 🎉</span>
              ) : (
                <span>전체 1,189장 중 <strong className="text-brand">{totalUnreadChaptersCount}장</strong>을 더 읽어야 합니다.</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {totalUnreadChaptersCount > 0 && (
            <span className="chip hidden bg-brand text-white sm:inline-flex">
              {totalUnreadChaptersCount}장 남음
            </span>
          )}
          <span className={`material-symbols-outlined text-subtle transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            keyboard_arrow_down
          </span>
        </div>
      </button>

      {/* 펼쳐지는 상세 영역 */}
      {isOpen && (
        <div className="border-t border-line bg-canvas p-4 md:p-5">
          {totalUnreadChaptersCount === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-teal" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <p className="mt-2 text-[15px] font-bold text-ink">
                읽어야 할 성경 장이 없습니다!
              </p>
              <p className="text-[14px] text-muted">
                훌륭하게 하나님의 말씀을 읽어 가고 계십니다.
              </p>
            </div>
          ) : (
            <div>
              {/* 구약/신약 탭 스위처 */}
              <div className="mb-4 flex gap-1 rounded-xl bg-sunken p-1" role="tablist">
                <button
                  role="tab"
                  aria-selected={activeTab === "old"}
                  onClick={() => setActiveTab("old")}
                  className={tabClass("old")}
                >
                  구약 성경 ({oldUnreadCount}장)
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "new"}
                  onClick={() => setActiveTab("new")}
                  className={tabClass("new")}
                >
                  신약 성경 ({newUnreadCount}장)
                </button>
              </div>

              {/* 탭 내용 */}
              <div>
                {activeTab === "old" ? (
                  oldUnreadCount === 0 ? (
                    <div className="py-6 text-center text-[14px] text-teal-deep">
                      구약 성경을 모두 읽으셨습니다! 🌳
                    </div>
                  ) : (
                    renderBookGrid(oldTestamentBooks)
                  )
                ) : newUnreadCount === 0 ? (
                  <div className="py-6 text-center text-[14px] text-teal-deep">
                    신약 성경을 모두 읽으셨습니다! 🕊️
                  </div>
                ) : (
                  renderBookGrid(newTestamentBooks)
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
