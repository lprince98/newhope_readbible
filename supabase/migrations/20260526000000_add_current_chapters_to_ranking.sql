-- ================================================================
-- readbible: 개인별 랭킹 함수 수정 - 현재 독 진행 장수(current_chapters) 추가
-- 반환 형식이 변경되므로 DROP 후 재생성
-- ================================================================

DROP FUNCTION IF EXISTS get_individual_ranking();

CREATE OR REPLACE FUNCTION get_individual_ranking()
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
  LEFT JOIN reading_records rr ON p.id = rr.user_id
  GROUP BY p.id, p.name, t.name
  ORDER BY total_chapters DESC
  LIMIT 10;
$$;

COMMENT ON FUNCTION get_individual_ranking IS '개인별 누적 장수, 통독 횟수, 현재 독 진행 장수(% 1189)를 집계하여 Top 10 랭킹 데이터를 반환합니다.';
