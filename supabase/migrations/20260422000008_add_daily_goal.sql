-- ================================================================
-- readbible: 사용자별 맞춤 목표 설정 기능 추가
-- Migration: 0009_add_daily_goal_to_profile
-- ================================================================

-- 1. profiles 테이블에 daily_goal 컬럼 추가 (기본값 4)
ALTER TABLE profiles 
ADD COLUMN daily_goal integer NOT NULL DEFAULT 4;

-- 2. daily_goal은 최소 1장 이상이어야 함을 보장하는 제약 조건 추가
ALTER TABLE profiles
ADD CONSTRAINT daily_goal_min_check CHECK (daily_goal >= 1);

COMMENT ON COLUMN profiles.daily_goal IS '사용자가 설정한 하루 성경 통독 목표 장수';
