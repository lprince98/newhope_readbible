-- ================================================================
-- readbible: 새 시즌(2026-11-01~) 팀 재구성을 위한 팀 초기화
-- 1) 기존 팀 · 팀원 소속 · 응원 채팅 · 초대 내역을 archive 스키마에 백업
--    (archive 스키마는 API에 노출되지 않으며 RLS로도 막아 둠)
-- 2) 모든 팀원 소속 해제 후 팀 삭제 (채팅·초대는 ON DELETE CASCADE로 함께 삭제)
-- 읽기 기록(reading_records)과 프로필은 건드리지 않습니다.
-- ================================================================

CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM anon, authenticated;

-- 1. 백업
CREATE TABLE archive.season1_teams AS
  SELECT * FROM public.teams;

CREATE TABLE archive.season1_team_members AS
  SELECT p.id AS user_id, p.name AS user_name, p.team_id, t.name AS team_name,
         (t.leader_id = p.id) AS is_leader
  FROM public.profiles p
  JOIN public.teams t ON t.id = p.team_id;

CREATE TABLE archive.season1_team_messages AS
  SELECT * FROM public.team_messages;

CREATE TABLE archive.season1_team_invitations AS
  SELECT * FROM public.team_invitations;

ALTER TABLE archive.season1_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive.season1_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive.season1_team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive.season1_team_invitations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE archive.season1_teams IS '2026-11-01 시즌 시작 전 팀 목록 백업';
COMMENT ON TABLE archive.season1_team_members IS '2026-11-01 시즌 시작 전 팀원 소속 백업';
COMMENT ON TABLE archive.season1_team_messages IS '2026-11-01 시즌 시작 전 팀 응원 채팅 백업';
COMMENT ON TABLE archive.season1_team_invitations IS '2026-11-01 시즌 시작 전 팀 초대 내역 백업';

-- 2. 초기화
UPDATE public.profiles SET team_id = NULL WHERE team_id IS NOT NULL;
DELETE FROM public.teams;
