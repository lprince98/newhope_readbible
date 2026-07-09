const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// BOM 이슈 등을 방지하기 위해 .env.local 파일을 직접 읽어서 환경변수에 주입
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  // UTF-8 BOM(\ufeff) 제거
  const cleanEnvContent = envContent.replace(/^\uFEFF/, "");
  
  cleanEnvContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const delimiterIndex = trimmed.indexOf("=");
    if (delimiterIndex === -1) return;
    const key = trimmed.substring(0, delimiterIndex).trim();
    const value = trimmed.substring(delimiterIndex + 1).trim();
    process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("오류: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 성경 66권 매핑 정보
const BIBLE_MAP = {
  gen: "창세기", exo: "출애굽기", lev: "레위기", num: "민수기", deu: "신명기", jos: "여호수아", jdg: "사사기", rut: "룻기",
  "1sa": "사무엘상", "2sa": "사무엘하", "1ki": "열왕기상", "2ki": "열왕기하", "1ch": "역대상", "2ch": "역대하", ezr: "에스라",
  neh: "느헤미야", est: "에스더", job: "욥기", psa: "시편", pro: "잠언", ecc: "전도서", sng: "아가", isa: "이사야", jer: "예레미야",
  lam: "예레미야애가", ezk: "에스겔", dan: "다니엘", hos: "호세아", jol: "요엘", amo: "아모스", oba: "오바댜", jon: "요나",
  mic: "미가", nah: "나훔", hab: "하박국", zep: "스바냐", hag: "학개", zec: "스가랴", mal: "말라기",
  mat: "마태복음", mrk: "마가복음", luk: "누가복음", jhn: "요한복음", act: "사도행전", rom: "로마서", "1co": "고린도전서",
  "2co": "고린도후서", gal: "갈라디아서", eph: "에베소서", php: "빌립보서", col: "골로새서", "1th": "데살로니가전서",
  "2th": "데살로니가후서", "1ti": "디모데전서", "2ti": "디모데후서", tit: "디도서", phm: "빌레몬서", heb: "히브리서",
  jas: "야고보서", "1pe": "베드로전서", "2pe": "베드로후서", "1jn": "요한일서", "2jn": "요한이서", "3jn": "요한삼서",
  jud: "유다서", rev: "요한계시록"
};

// CSV 필드 탈출 처리 함수
function escapeCsv(val) {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

// Supabase 대량 데이터 페이징 수집 헬퍼 함수
async function fetchAllData(table, queryBuilderFn) {
  let allData = [];
  let from = 0;
  const step = 1000;
  let hasMore = true;

  while (hasMore) {
    let baseQuery = supabase.from(table).select("*");
    if (queryBuilderFn) {
      baseQuery = queryBuilderFn(baseQuery);
    }
    
    const { data, error } = await baseQuery.range(from, from + step - 1);
    if (error) throw error;

    allData = allData.concat(data);
    if (data.length < step) {
      hasMore = false;
    } else {
      from += step;
    }
  }

  return allData;
}

async function runArchive() {
  console.log(">>> 아카이브 작업을 시작합니다...");
  console.log(">>> 데이터베이스 연결 및 데이터 수집 중 (대용량 페이징 처리)...");

  try {
    // 1. 7월 1일 이전 읽기 기록 전체 페이징 조회
    const records = await fetchAllData("reading_records", (q) => 
      q.lt("read_at", "2026-07-01").order("read_at", { ascending: true })
    );
    console.log(`>>> 7월 1일 이전 읽기 기록 총 ${records.length}개를 불러왔습니다.`);

    // 2. 프로필 전체 페이징 조회
    const profiles = await fetchAllData("profiles");
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    console.log(`>>> 사용자 프로필 총 ${profiles.length}개를 불러왔습니다.`);

    // 3. 팀 전체 페이징 조회
    const teams = await fetchAllData("teams");
    const teamMap = new Map(teams.map(t => [t.id, t.name]));
    console.log(`>>> 소그룹 팀 총 ${teams.length}개를 불러왔습니다.`);

    // 4. 데이터 가공 및 조인
    const archivedList = [];
    for (const record of records) {
      const user = profileMap.get(record.user_id);
      const userName = user ? user.name : "알 수 없는 사용자";
      const teamName = user && user.team_id ? (teamMap.get(user.team_id) ?? "팀 미배정") : "팀 미배정";
      const bookName = BIBLE_MAP[record.book_id] ?? record.book_id;
      const count = record.end_chapter - record.start_chapter + 1;

      archivedList.push({
        record_id: record.id,
        user_id: record.user_id,
        user_name: userName,
        team_name: teamName,
        book_id: record.book_id,
        book_name: bookName,
        start_chapter: record.start_chapter,
        end_chapter: record.end_chapter,
        chapter_count: count,
        read_at: record.read_at,
        memo: record.memo ?? "",
        created_at: record.created_at
      });
    }

    // 5. 아카이브 디렉토리 생성
    const archiveDir = path.join(__dirname, "..", "archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    // 6. JSON 파일 쓰기
    const jsonPath = path.join(archiveDir, "reading_records_archive_20260701.json");
    fs.writeFileSync(jsonPath, JSON.stringify(archivedList, null, 2), "utf8");
    console.log(`>>> JSON 아카이브 파일 생성 완료: ${jsonPath}`);

    // 7. CSV 파일 쓰기 (Excel 호환을 위한 BOM 헤더 추가)
    const csvHeaders = ["사용자명", "소속팀", "성경책", "시작장", "종료장", "총 읽은 장수", "읽은날짜", "메모"];
    const csvRows = [csvHeaders.join(",")];

    for (const item of archivedList) {
      const row = [
        escapeCsv(item.user_name),
        escapeCsv(item.team_name),
        escapeCsv(item.book_name),
        item.start_chapter,
        item.end_chapter,
        item.chapter_count,
        item.read_at,
        escapeCsv(item.memo)
      ];
      csvRows.push(row.join(","));
    }

    const csvPath = path.join(archiveDir, "reading_records_archive_20260701.csv");
    const csvContent = "\ufeff" + csvRows.join("\n"); // UTF-8 BOM 추가
    fs.writeFileSync(csvPath, csvContent, "utf8");
    console.log(`>>> CSV 아카이브 파일 생성 완료: ${csvPath}`);

    console.log(">>> 모든 아카이브 작업이 성공적으로 완료되었습니다!");
  } catch (error) {
    console.error(">>> 아카이브 작업 중 오류 발생:", error.message);
    process.exit(1);
  }
}

runArchive();
