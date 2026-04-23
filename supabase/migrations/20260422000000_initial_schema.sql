-- ================================================================
-- readbible: 새소망교회 성경 통독 앱 초기 스키마
-- Migration: 0001_initial_schema
-- ================================================================

-- ── 1. 팀 테이블 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE teams IS '소그룹/셀 팀';

-- ── 2. 사용자 프로필 ───────────────────────────────────────────────
-- auth.users 와 1:1 연결. 회원가입 시 생성.
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name        text        NOT NULL,
  team_id     uuid        REFERENCES teams (id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS '사용자 프로필 (auth.users 확장)';

-- ── 3. 읽기 기록 ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reading_records (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid  NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  book_id       text  NOT NULL,          -- 'gen', 'exo', 'mat' 등 66권 ID
  start_chapter int   NOT NULL CHECK (start_chapter >= 1),
  end_chapter   int   NOT NULL CHECK (end_chapter >= start_chapter),
  memo          text,
  read_at       date  NOT NULL DEFAULT CURRENT_DATE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE reading_records IS '성경 읽기 기록 (책 + 장 범위)';
CREATE INDEX IF NOT EXISTS idx_reading_records_user_id ON reading_records (user_id);
CREATE INDEX IF NOT EXISTS idx_reading_records_read_at ON reading_records (read_at);

-- ── 4. 팀별 누적 장 수 집계 함수 ───────────────────────────────────
CREATE OR REPLACE FUNCTION get_team_chapter_counts()
RETURNS TABLE (
  team_id        uuid,
  team_name      text,
  total_chapters bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.id                                                          AS team_id,
    t.name                                                        AS team_name,
    COALESCE(SUM(r.end_chapter - r.start_chapter + 1), 0)       AS total_chapters
  FROM teams t
  LEFT JOIN profiles  p ON p.team_id = t.id
  LEFT JOIN reading_records r ON r.user_id = p.id
  GROUP BY t.id, t.name
  ORDER BY total_chapters DESC;
$$;

-- ── 5. 신규 회원가입 시 profiles 자동 생성 트리거 ────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 6. RLS (Row Level Security) 활성화 ────────────────────────────
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_records ENABLE ROW LEVEL SECURITY;

-- profiles 정책
CREATE POLICY "자신의 프로필만 조회"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "자신의 프로필만 수정"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- teams 정책 (모두 읽기 가능, 쓰기는 서비스 롤만)
CREATE POLICY "팀 목록 전체 공개"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

-- reading_records 정책
CREATE POLICY "자신의 기록만 조회"
  ON reading_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "자신의 기록만 추가"
  ON reading_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "자신의 기록만 삭제"
  ON reading_records FOR DELETE
  USING (auth.uid() = user_id);

-- get_team_chapter_counts 함수는 집계 결과만 반환 (개인 정보 노출 없음)
GRANT EXECUTE ON FUNCTION get_team_chapter_counts TO authenticated;

-- ── 7. 초기 팀 데이터 (Seed) ────────────────────────────────────────
-- ── (참고: 기존 샘플 데이터 삽입 구문은 제거됨) ─────────────────────────
