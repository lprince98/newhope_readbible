-- ================================================================
-- readbible: 새 시즌(2026-11-01~)을 위한 가입 계정 초기화
-- 오래되어 계정 정보를 기억하지 못하는 성도가 많아, 관리자 계정 1개만 남기고
-- 모든 계정을 삭제한 뒤 새로 가입하도록 합니다.
-- 1) 회원 정보(이메일·이름·가입일 등, 비밀번호 제외)와 전체 읽기 기록을 archive 스키마에 백업
-- 2) 관리자 외 모든 auth.users 삭제
--    → profiles, reading_records, team_messages 등은 ON DELETE CASCADE로 함께 삭제
-- 관리자 계정을 찾지 못하면 아무것도 삭제하지 않고 중단합니다.
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lilprince98@gmail.com') THEN
    RAISE EXCEPTION '관리자 계정(lilprince98@gmail.com)을 찾을 수 없어 계정 초기화를 중단합니다.';
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS archive;
REVOKE ALL ON SCHEMA archive FROM anon, authenticated;

-- 1. 백업
CREATE TABLE archive.season1_members AS
  SELECT u.id AS user_id, u.email, p.name, p.daily_goal,
         u.created_at, u.last_sign_in_at, u.raw_user_meta_data
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id;

CREATE TABLE archive.season1_reading_records AS
  SELECT r.*, p.name AS user_name
  FROM public.reading_records r
  LEFT JOIN public.profiles p ON p.id = r.user_id;

ALTER TABLE archive.season1_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive.season1_reading_records ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE archive.season1_members IS '2026-11-01 시즌 시작 전 가입 회원 백업 (비밀번호 제외)';
COMMENT ON TABLE archive.season1_reading_records IS '2026-11-01 시즌 시작 전 전체 읽기 기록 백업';

-- 2. 관리자 외 계정 삭제
DELETE FROM auth.users WHERE email IS DISTINCT FROM 'lilprince98@gmail.com';
