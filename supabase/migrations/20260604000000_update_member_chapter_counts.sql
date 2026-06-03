-- ================================================================
-- readbible: 특정 팀 내 개별 팀원별 읽기 장수 집계 함수 수정
-- 반환 형식이 변경되므로 DROP 후 재생성
-- ================================================================

DROP FUNCTION IF EXISTS get_member_chapter_counts(uuid);

CREATE OR REPLACE FUNCTION get_member_chapter_counts(target_team_id uuid)
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
  FROM 
    profiles p
  LEFT JOIN 
    reading_records rr ON p.id = rr.user_id
  WHERE 
    p.team_id = target_team_id
  GROUP BY 
    p.id, p.name
  ORDER BY 
    total_chapters DESC, p.name ASC;
$$;

COMMENT ON FUNCTION get_member_chapter_counts IS '특정 팀 내 개별 팀원들의 통독 진행 현황(누적 장수, 독 수, 현재 독 진행 장수)을 집계하여 반환합니다.';
