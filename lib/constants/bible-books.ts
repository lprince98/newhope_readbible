/** 성경 66권 메타데이터 상수 */
export const BIBLE_BOOKS = [
  // ── 구약 (39권) ──────────────────────────────────────────
  { id: "gen",  name: "창세기",     testament: "old" as const, chapters: 50 },
  { id: "exo",  name: "출애굽기",   testament: "old" as const, chapters: 40 },
  { id: "lev",  name: "레위기",     testament: "old" as const, chapters: 27 },
  { id: "num",  name: "민수기",     testament: "old" as const, chapters: 36 },
  { id: "deu",  name: "신명기",     testament: "old" as const, chapters: 34 },
  { id: "jos",  name: "여호수아",   testament: "old" as const, chapters: 24 },
  { id: "jdg",  name: "사사기",     testament: "old" as const, chapters: 21 },
  { id: "rut",  name: "룻기",       testament: "old" as const, chapters: 4  },
  { id: "1sa",  name: "사무엘상",   testament: "old" as const, chapters: 31 },
  { id: "2sa",  name: "사무엘하",   testament: "old" as const, chapters: 24 },
  { id: "1ki",  name: "열왕기상",   testament: "old" as const, chapters: 22 },
  { id: "2ki",  name: "열왕기하",   testament: "old" as const, chapters: 25 },
  { id: "1ch",  name: "역대상",     testament: "old" as const, chapters: 29 },
  { id: "2ch",  name: "역대하",     testament: "old" as const, chapters: 36 },
  { id: "ezr",  name: "에스라",     testament: "old" as const, chapters: 10 },
  { id: "neh",  name: "느헤미야",   testament: "old" as const, chapters: 13 },
  { id: "est",  name: "에스더",     testament: "old" as const, chapters: 10 },
  { id: "job",  name: "욥기",       testament: "old" as const, chapters: 42 },
  { id: "psa",  name: "시편",       testament: "old" as const, chapters: 150 },
  { id: "pro",  name: "잠언",       testament: "old" as const, chapters: 31 },
  { id: "ecc",  name: "전도서",     testament: "old" as const, chapters: 12 },
  { id: "sng",  name: "아가",       testament: "old" as const, chapters: 8  },
  { id: "isa",  name: "이사야",     testament: "old" as const, chapters: 66 },
  { id: "jer",  name: "예레미야",   testament: "old" as const, chapters: 52 },
  { id: "lam",  name: "예레미야애가",testament: "old" as const, chapters: 5  },
  { id: "ezk",  name: "에스겔",     testament: "old" as const, chapters: 48 },
  { id: "dan",  name: "다니엘",     testament: "old" as const, chapters: 12 },
  { id: "hos",  name: "호세아",     testament: "old" as const, chapters: 14 },
  { id: "jol",  name: "요엘",       testament: "old" as const, chapters: 3  },
  { id: "amo",  name: "아모스",     testament: "old" as const, chapters: 9  },
  { id: "oba",  name: "오바댜",     testament: "old" as const, chapters: 1  },
  { id: "jon",  name: "요나",       testament: "old" as const, chapters: 4  },
  { id: "mic",  name: "미가",       testament: "old" as const, chapters: 7  },
  { id: "nah",  name: "나훔",       testament: "old" as const, chapters: 3  },
  { id: "hab",  name: "하박국",     testament: "old" as const, chapters: 3  },
  { id: "zep",  name: "스바냐",     testament: "old" as const, chapters: 3  },
  { id: "hag",  name: "학개",       testament: "old" as const, chapters: 2  },
  { id: "zec",  name: "스가랴",     testament: "old" as const, chapters: 14 },
  { id: "mal",  name: "말라기",     testament: "old" as const, chapters: 4  },

  // ── 신약 (27권) ──────────────────────────────────────────
  { id: "mat",  name: "마태복음",   testament: "new" as const, chapters: 28 },
  { id: "mrk",  name: "마가복음",   testament: "new" as const, chapters: 16 },
  { id: "luk",  name: "누가복음",   testament: "new" as const, chapters: 24 },
  { id: "jhn",  name: "요한복음",   testament: "new" as const, chapters: 21 },
  { id: "act",  name: "사도행전",   testament: "new" as const, chapters: 28 },
  { id: "rom",  name: "로마서",     testament: "new" as const, chapters: 16 },
  { id: "1co",  name: "고린도전서", testament: "new" as const, chapters: 16 },
  { id: "2co",  name: "고린도후서", testament: "new" as const, chapters: 13 },
  { id: "gal",  name: "갈라디아서", testament: "new" as const, chapters: 6  },
  { id: "eph",  name: "에베소서",   testament: "new" as const, chapters: 6  },
  { id: "php",  name: "빌립보서",   testament: "new" as const, chapters: 4  },
  { id: "col",  name: "골로새서",   testament: "new" as const, chapters: 4  },
  { id: "1th",  name: "데살로니가전서", testament: "new" as const, chapters: 5 },
  { id: "2th",  name: "데살로니가후서", testament: "new" as const, chapters: 3 },
  { id: "1ti",  name: "디모데전서", testament: "new" as const, chapters: 6  },
  { id: "2ti",  name: "디모데후서", testament: "new" as const, chapters: 4  },
  { id: "tit",  name: "디도서",     testament: "new" as const, chapters: 3  },
  { id: "phm",  name: "빌레몬서",   testament: "new" as const, chapters: 1  },
  { id: "heb",  name: "히브리서",   testament: "new" as const, chapters: 13 },
  { id: "jas",  name: "야고보서",   testament: "new" as const, chapters: 5  },
  { id: "1pe",  name: "베드로전서", testament: "new" as const, chapters: 5  },
  { id: "2pe",  name: "베드로후서", testament: "new" as const, chapters: 3  },
  { id: "1jn",  name: "요한일서",   testament: "new" as const, chapters: 5  },
  { id: "2jn",  name: "요한이서",   testament: "new" as const, chapters: 1  },
  { id: "3jn",  name: "요한삼서",   testament: "new" as const, chapters: 1  },
  { id: "jud",  name: "유다서",     testament: "new" as const, chapters: 1  },
  { id: "rev",  name: "요한계시록", testament: "new" as const, chapters: 22 },
] as const;

export type BibleBookId = (typeof BIBLE_BOOKS)[number]["id"];
export type Testament = "old" | "new";

/** 전체 장 수: 1,189장 */
export const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);

/** id로 권 정보 조회 */
export function getBibleBook(id: BibleBookId) {
  return BIBLE_BOOKS.find((b) => b.id === id)!;
}
