-- profiles 테이블의 daily_goal 컬럼 수정 권한을 명확히 허용
-- 사용자가 자신의 프로필만 업데이트할 수 있도록 보장
drop policy if exists "사용자는 자신의 프로필을 수정할 수 있다." on profiles;

create policy "사용자는 자신의 프로필을 수정할 수 있다."
on profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 기존에 select 권한이 없다면 추가 (대시보드 조회용)
drop policy if exists "인증된 사용자는 프로필을 조회할 수 있다." on profiles;

create policy "인증된 사용자는 프로필을 조회할 수 있다."
on profiles for select
to authenticated
using (true);
