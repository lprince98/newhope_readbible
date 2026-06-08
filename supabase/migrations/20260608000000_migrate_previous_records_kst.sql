-- ================================================================
-- readbible: 기존 읽기 기록의 read_at 날짜를 생성일(created_at)의 KST(한국 시간) 날짜로 보정
-- ================================================================

UPDATE reading_records
SET read_at = timezone('Asia/Seoul', created_at)::date
WHERE read_at IS DISTINCT FROM timezone('Asia/Seoul', created_at)::date;
