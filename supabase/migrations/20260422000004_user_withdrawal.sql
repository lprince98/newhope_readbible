-- ================================================================
-- readbible: 회원 탈퇴 기능 (Self-service withdrawal)
-- Migration: 0005_user_withdrawal
-- ================================================================

-- ── 1. 회원 탈퇴를 위한 보안 정의자 함수 ───────────────────────────
-- 기존 함수 삭제 (반환 타입 변경을 위해 필요)
DROP FUNCTION IF EXISTS delete_user();

CREATE OR REPLACE FUNCTION delete_user()
RETURNS text -- 결과를 텍스트로 반환하도록 수정 (디버깅 용도)

LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
DECLARE
  current_uid uuid;
BEGIN
  -- 현재 세션의 UID 가져오기
  current_uid := auth.uid();
  
  IF current_uid IS NULL THEN
    RAISE EXCEPTION '인증된 사용자를 찾을 수 없습니다. (UID is NULL)';
  END IF;

  -- auth.users 테이블에서 삭제
  DELETE FROM auth.users WHERE id = current_uid;
  
  RETURN '탈퇴 성공: ' || current_uid::text;
END;
$$;


COMMENT ON FUNCTION delete_user() IS '사용자가 자신의 계정을 영구 삭제합니다.';

-- 인증된 사용자만 이 함수를 실행할 수 있도록 권한 부여
REVOKE ALL ON FUNCTION delete_user() FROM public;
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

