-- ================================================================
-- readbible: 팀 관리자(팀장) 권한 강화
-- Migration: 0003_team_leader_security
-- ================================================================

-- ── 1. 팀 테이블에 팀장(leader_id) 컬럼 추가 ────────────────────────
ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN teams.leader_id IS '팀 관리 권한을 가진 사용자 ID';

-- 초기 데이터 보충: 팀에 소속된 멤버 중 가장 먼저 가입한 사람을 팀장으로 지정 (임시)
UPDATE teams t
SET leader_id = (
  SELECT id FROM profiles p 
  WHERE p.team_id = t.id 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE leader_id IS NULL;

-- ── 2. RLS 정책 수정 ────────────────────────────────────────────────

-- teams: 팀장만 이름 수정 가능
DROP POLICY IF EXISTS "팀 목록 전체 공개" ON teams;
CREATE POLICY "팀 목록 전체 공개" ON teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "팀장만 팀 정보 수정" 
  ON teams FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = leader_id);

-- profiles: 팀장만 다른 팀원을 팀에서 제외(team_id = null) 가능
-- (본인 정보 수정 정책은 기존 유지: auth.uid() = id)
CREATE POLICY "팀장만 팀원 관리" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = (SELECT leader_id FROM teams WHERE id = profiles.team_id)
  )
  WITH CHECK (
    -- 팀장은 다른 팀원의 team_id를 null로만 바꿀 수 있음 (다른 팀으로 강제 이동은 불가)
    (auth.uid() = (SELECT leader_id FROM teams WHERE id = profiles.team_id) AND team_id IS NULL)
    OR (auth.uid() = id) -- 본인 수정 허용
  );

-- team_invitations: 팀장만 초대 생성/삭제 가능
DROP POLICY IF EXISTS "팀원만 초대 목록 조회" ON team_invitations;
CREATE POLICY "팀원만 초대 목록 조회" ON team_invitations FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "팀원만 초대 생성" ON team_invitations;
CREATE POLICY "팀장만 초대 생성" 
  ON team_invitations FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = (SELECT leader_id FROM teams WHERE id = team_id)
  );

DROP POLICY IF EXISTS "초대자만 초대 취소" ON team_invitations;
CREATE POLICY "팀장만 초대 취소" 
  ON team_invitations FOR DELETE 
  TO authenticated 
  USING (
    auth.uid() = (SELECT leader_id FROM teams WHERE id = team_id)
  );
