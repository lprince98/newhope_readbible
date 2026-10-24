-- ================================================================
-- readbible: 시즌 시작일(since_date) 기준 집계 지원
-- 새 시즌(2026-11-01~)부터 다시 집계하기 위해 랭킹/팀 집계 함수에 선택적 시작일 인자를 추가합니다.
-- since_date가 NULL이면 기존과 동일하게 전체 기간을 집계합니다.
-- 인자 목록이 바뀌므로 DROP 후 재생성
-- ================================================================

DROP FUNCTION IF EXISTS get_team_chapter_counts();
DROP FUNCTION IF EXISTS get_individual_ranking();
DROP FUNCTION IF EXISTS get_member_chapter_counts(uuid);

-- 1. 팀별 누적 장 수
CREATE OR REPLACE FUNCTION get_team_chapter_counts(since_date date DEFAULT NULL)
RETURNS TABLE (
  team_id        uuid,
  team_name      text,
  total_chapters bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    t.id                                                    AS team_id,
    t.name                                                  AS team_name,
    COALESCE(SUM(r.end_chapter - r.start_chapter + 1), 0)  AS total_chapters
  FROM teams t
  LEFT JOIN profiles p ON p.team_id = t.id
  LEFT JOIN reading_records r
    ON r.user_id = p.id
   AND (since_date IS NULL OR r.read_at >= since_date)
  GROUP BY t.id, t.name
  ORDER BY total_chapters DESC;
$$;

-- 2. 개인별 Top 10
CREATE OR REPLACE FUNCTION get_individual_ranking(since_date date DEFAULT NULL)
RETURNS TABLE (
  user_id          uuid,
  user_name        text,
  team_name        text,
  total_chapters   bigint,
  full_read_count  int,
  current_chapters int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.name AS user_name,
    t.name AS team_name,
    COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) AS total_chapters,
    FLOOR(COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) / 1189.0)::int AS full_read_count,
    (COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) % 1189)::int AS current_chapters
  FROM profiles p
  LEFT JOIN teams t ON p.team_id = t.id
  LEFT JOIN reading_records rr
    ON p.id = rr.user_id
   AND (since_date IS NULL OR rr.read_at >= since_date)
  GROUP BY p.id, p.name, t.name
  ORDER BY total_chapters DESC
  LIMIT 10;
$$;

-- 3. 특정 팀의 팀원별 현황
CREATE OR REPLACE FUNCTION get_member_chapter_counts(target_team_id uuid, since_date date DEFAULT NULL)
RETURNS TABLE (
  user_id          uuid,
  user_name        text,
  total_chapters   bigint,
  full_read_count  int,
  current_chapters int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.name AS user_name,
    COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) AS total_chapters,
    FLOOR(COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) / 1189.0)::int AS full_read_count,
    (COALESCE(SUM(rr.end_chapter - rr.start_chapter + 1), 0) % 1189)::int AS current_chapters
  FROM profiles p
  LEFT JOIN reading_records rr
    ON p.id = rr.user_id
   AND (since_date IS NULL OR rr.read_at >= since_date)
  WHERE p.team_id = target_team_id
  GROUP BY p.id, p.name
  ORDER BY total_chapters DESC, p.name ASC;
$$;

GRANT EXECUTE ON FUNCTION get_team_chapter_counts(date) TO authenticated;
GRANT EXECUTE ON FUNCTION get_individual_ranking(date) TO authenticated;
GRANT EXECUTE ON FUNCTION get_member_chapter_counts(uuid, date) TO authenticated;

COMMENT ON FUNCTION get_team_chapter_counts(date) IS '팀별 누적 장 수 (since_date 이후 기록만, NULL이면 전체).';
COMMENT ON FUNCTION get_individual_ranking(date) IS '개인별 Top 10 랭킹 (since_date 이후 기록만, NULL이면 전체).';
COMMENT ON FUNCTION get_member_chapter_counts(uuid, date) IS '특정 팀원별 통독 현황 (since_date 이후 기록만, NULL이면 전체).';
