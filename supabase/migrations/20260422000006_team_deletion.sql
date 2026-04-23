-- ================================================================
-- readbible: 팀 삭제 기능 추가
-- Migration: 0007_team_deletion
-- ================================================================

-- 1. teams 테이블에 DELETE 정책 추가
-- 팀장만 자신이 이끄는 팀을 삭제할 수 있음
DROP POLICY IF EXISTS "팀장만 팀 삭제 가능" ON teams;

CREATE POLICY "팀장만 팀 삭제 가능" 
  ON teams FOR DELETE 
  TO authenticated 
  USING (auth.uid() = leader_id);

COMMENT ON POLICY "팀장만 팀 삭제 가능" ON teams IS '팀장은 자신이 생성한 팀을 해체(삭제)할 수 있습니다.';
