-- ================================================================
-- readbible: 카카오 로그인 대비 — 신규 가입 시 프로필 이름 결정 방식 보강
-- 기존 함수는 이름이 없으면 이메일 앞부분을 썼는데, 카카오 계정은 이메일이 없을 수 있어
-- profiles.name(NOT NULL)이 비면서 가입 자체가 실패합니다.
-- 이메일 가입: 입력한 이름(name) / 카카오: 닉네임 → 그래도 없으면 '성도'
-- (카카오 가입자는 처음 로그인할 때 /welcome 화면에서 실명을 다시 입력합니다)
-- ================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(btrim(NEW.raw_user_meta_data ->> 'name'), ''),
      NULLIF(btrim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(btrim(NEW.raw_user_meta_data ->> 'nickname'), ''),
      NULLIF(btrim(NEW.raw_user_meta_data ->> 'user_name'), ''),
      NULLIF(btrim(NEW.raw_user_meta_data ->> 'preferred_username'), ''),
      NULLIF(split_part(NEW.email, '@', 1), ''),
      '성도'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
