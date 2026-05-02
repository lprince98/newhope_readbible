-- ================================================================
-- readbible: 개인별 랭킹 조회를 위한 RPC 함수 추가
-- ================================================================

-- 개인별 총 통독 장 수를 계산하여 상위 10명을 반환하는 함수
CREATE OR REPLACE FUNCTION get_individual_ranking()
RETURNS TABLE (
  user_id        uuid,
  user_name      text,
  team_name      text,
  total_chapters bigint
)
LANGUAGE sql
SECURITY DEFINER -- 관리자 권한으로 실행되어 모든 유저의 데이터를 집계함
SET search_path = public
STABLE
AS $$
  SELECT
    p.id AS user_id,
    p.name AS user_name,
    t.name AS team_name,
    COALESCE(SUM(r.end_chapter - r.start_chapter + 1), 0) AS total_chapters
  FROM profiles p
  LEFT JOIN teams t ON p.team_id = t.id
  JOIN reading_records r ON r.user_id = p.id
  GROUP BY p.id, p.name, t.name
  ORDER BY total_chapters DESC
  LIMIT 10;
$$;

COMMENT ON FUNCTION get_individual_ranking IS '모든 유저의 개인별 누적 장 수를 집계하여 Top 10 랭킹용 데이터를 반환합니다.';
