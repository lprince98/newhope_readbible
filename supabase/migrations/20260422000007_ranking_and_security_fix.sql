-- ================================================================
-- readbible: 랭킹 시스템 활성화 및 보안 정책(RLS) 최적화
-- Migration: 0008_ranking_and_security_fix
-- ================================================================

-- 1. 프로필 조회 권한 완화
-- 팀 상세 페이지에서 팀원 이름을 확인하고, 랭킹에서 사용자 정보를 표시하기 위해 필요
DROP POLICY IF EXISTS "자신의 프로필만 조회" ON profiles;
DROP POLICY IF EXISTS "인증된 사용자는 기본 프로필 조회 가능" ON profiles;

CREATE POLICY "인증된 사용자는 기본 프로필 조회 가능" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (true);

COMMENT ON POLICY "인증된 사용자는 기본 프로필 조회 가능" ON profiles IS '팀원 목록 및 랭킹 표시를 위해 모든 사용자의 기본 프로필 조회를 허용합니다.';

-- 2. 읽기 기록 조회 권한 최적화
-- 같은 팀 소속 멤버들끼리만 서로의 상세 읽기 활동(Activity Feed)을 볼 수 있도록 제한적 허용
DROP POLICY IF EXISTS "자신의 기록만 조회" ON reading_records;
DROP POLICY IF EXISTS "같은 팀 멤버의 기록 조회 가능" ON reading_records;

CREATE POLICY "같은 팀 멤버의 기록 조회 가능" 
  ON reading_records FOR SELECT 
  TO authenticated 
  USING (
    auth.uid() = user_id OR 
    (SELECT team_id FROM profiles WHERE id = auth.uid()) = 
    (SELECT team_id FROM profiles WHERE id = user_id)
  );

COMMENT ON POLICY "같은 팀 멤버의 기록 조회 가능" ON reading_records IS '팀 내 응원을 위해 같은 팀 소속 사용자의 읽기 기록 조회를 허용합니다.';

-- 3. 팀별 집계 함수 보안 설정 변경 (랭킹 시스템 핵심)
-- SECURITY DEFINER를 설정하여 RLS 정책과 상관없이 모든 팀의 총합을 계산할 수 있게 함
CREATE OR REPLACE FUNCTION get_team_chapter_counts()
RETURNS TABLE (
  team_id        uuid,
  team_name      text,
  total_chapters bigint
)
LANGUAGE sql
SECURITY DEFINER -- 관리자 권한으로 실행되어 모든 팀의 데이터를 집계함
SET search_path = public
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

COMMENT ON FUNCTION get_team_chapter_counts IS '모든 팀의 누적 장 수를 집계하여 랭킹용 데이터를 반환합니다 (보안 정의자 설정됨).';
