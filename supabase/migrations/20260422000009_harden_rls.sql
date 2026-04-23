-- ================================================================
-- readbible: 보안 강화 (RLS 2중 방어막 구축)
-- Migration: 0010_harden_security_policies
-- ================================================================

-- 1. 읽기 기록(reading_records) 보안 강화
-- 삭제/수정은 오직 본인만 가능하도록 엄격히 제한
DROP POLICY IF EXISTS "자신의 기록만 수정 가능" ON reading_records;
CREATE POLICY "자신의 기록만 수정 가능" 
  ON reading_records FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "자신의 기록만 삭제 가능" ON reading_records;
CREATE POLICY "자신의 기록만 삭제 가능" 
  ON reading_records FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);


-- 2. 팀(teams) 보안 강화
-- 팀 정보 수정 및 삭제는 오직 팀장(leader_id)만 가능
DROP POLICY IF EXISTS "팀장은 자신의 팀 정보 수정 가능" ON teams;
CREATE POLICY "팀장은 자신의 팀 정보 수정 가능" 
  ON teams FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = leader_id);

DROP POLICY IF EXISTS "팀장은 자신의 팀 삭제 가능" ON teams;
CREATE POLICY "팀장은 자신의 팀 삭제 가능" 
  ON teams FOR DELETE 
  TO authenticated 
  USING (auth.uid() = leader_id);


-- 3. 프로필(profiles) 보안 강화
-- 자신의 프로필 daily_goal 등은 본인만 수정 가능
DROP POLICY IF EXISTS "자신의 프로필만 수정" ON profiles;
CREATE POLICY "자신의 프로필만 수정"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

COMMENT ON TABLE reading_records IS '사용자 성경 읽기 기록 - 본인 외 수정/삭제 절대 불가 정책 적용됨';
COMMENT ON TABLE teams IS '팀 정보 - 팀장 외 수정/삭제 절대 불가 정책 적용됨';
