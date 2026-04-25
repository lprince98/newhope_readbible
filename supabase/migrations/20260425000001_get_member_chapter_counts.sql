-- 팀 내 개별 팀원별 읽기 장 수 집계 함수
create or replace function get_member_chapter_counts(target_team_id uuid)
returns table (
  user_id uuid,
  user_name text,
  total_chapters bigint
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    p.id as user_id,
    p.name as user_name,
    coalesce(sum(rr.end_chapter - rr.start_chapter + 1), 0) as total_chapters
  from 
    profiles p
  left join 
    reading_records rr on p.id = rr.user_id
  where 
    p.team_id = target_team_id
  group by 
    p.id, p.name
  order by 
    total_chapters desc, p.name asc;
end;
$$;
