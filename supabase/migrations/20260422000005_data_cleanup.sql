-- ================================================================
-- readbible: 기존 샘플 데이터 정리 (Clean start)
-- Migration: 0006_data_cleanup
-- ================================================================

-- 1. 모든 프로필의 팀 소속 정보를 초기화 (참조 무결성 보호)
UPDATE public.profiles SET team_id = NULL;

-- 2. 모든 기존 팀 데이터 삭제 (새로운 팀 시스템으로 시작)
DELETE FROM public.teams;

COMMENT ON TABLE teams IS '사용자가 직접 생성하고 관리하는 팀 정보 테이블';
