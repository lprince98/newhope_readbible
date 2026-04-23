-- ================================================================
-- readbible: 팀 채팅 & 초대 테이블 추가
-- Migration: 0002_team_features
-- ================================================================

-- ── 1. 팀 채팅 메시지 ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    uuid        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE team_messages IS '팀 응원 채팅 메시지';
CREATE INDEX IF NOT EXISTS idx_team_messages_team_id ON team_messages (team_id, created_at DESC);

-- ── 2. 팀 초대 (이메일 기반) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_invitations (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id        uuid        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  invited_email  text        NOT NULL,
  invited_by     uuid        NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, invited_email)
);

COMMENT ON TABLE team_invitations IS '팀 이메일 초대 (미가입자 포함)';

-- ── 3. RLS 활성화 ──────────────────────────────────────────────────
ALTER TABLE team_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- team_messages: 같은 팀 멤버만 읽기/쓰기
CREATE POLICY "팀원만 메시지 조회"
  ON team_messages FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid() AND team_id IS NOT NULL
    )
  );

CREATE POLICY "팀원만 메시지 전송"
  ON team_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid() AND team_id IS NOT NULL
    )
  );

-- team_invitations: 팀 멤버만 조회, 팀 멤버만 초대
CREATE POLICY "팀원만 초대 목록 조회"
  ON team_invitations FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid() AND team_id IS NOT NULL
    )
  );

CREATE POLICY "팀원만 초대 생성"
  ON team_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = invited_by AND
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid() AND team_id IS NOT NULL
    )
  );

CREATE POLICY "초대자만 초대 취소"
  ON team_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = invited_by);

-- ── 4. Realtime 활성화 (team_messages) ───────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE team_messages;
