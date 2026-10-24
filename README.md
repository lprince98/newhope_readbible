# 새소망 성경 통독

새소망교회(기독교대한감리회) 성도들이 매일 읽은 성경을 기록하고, 팀과 함께 1,189장을 완주하는 웹앱입니다.

- 운영 주소: https://newhope-readbible.vercel.app
- 기술 스택: Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase (인증 · Postgres)

## 주요 기능

| 화면 | 경로 | 내용 |
|---|---|---|
| 홈 | `/home` | 오늘의 말씀, 오늘 목표 진도, 새 시즌 D-day 안내 |
| 기록 | `/record` | 읽은 성경(권·장) 기록, 하루 목표 설정, 최근 기록 수정·삭제 |
| 현황 | `/dashboard` | 오늘 달성률, 주간 그래프, 이번 시즌 통독 수, 안 읽은 장 목록 |
| 랭킹 | `/ranking` | 팀 랭킹 / 개인 Top 10 |
| 팀 | `/team` | 팀 만들기·가입, 팀원 현황, 활동 피드, 응원 채팅, 팀장 관리 |
| 프로필 | `/profile` | 내 정보, 로그아웃, 회원 탈퇴 |

로그인·가입은 **카카오 로그인만** 지원합니다. 처음 가입하면 `/welcome`에서 실명을 한 번 입력합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`.env.local`에 아래 값이 필요합니다 (Supabase 대시보드 → Project Settings → API).

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 기능 스위치와 시즌

[`lib/constants/features.ts`](lib/constants/features.ts)에서 조정합니다.

- `enableTeamFeatures` / `enableRanking`: 팀·랭킹 메뉴 켜기/끄기
- `uploadDeadline`: 기록 업로드 마감 일시 (`null`이면 무기한)
- `seasonStartDate`: 시즌 시작일. 이 날짜 이후 기록만 진도·랭킹·팀 현황에 집계됩니다.
  공유 미리보기 이미지의 날짜 배지도 이 값을 따릅니다.

## 디자인

- 교회 로고 색에서 뽑은 토큰을 [`app/globals.css`](app/globals.css)에 정의했습니다.
  자주(`brand`, 십자가) = 주요 버튼·활성 메뉴, 청록(`teal`, 잎사귀) = 진도·성장.
- 공통 클래스: `.card`, `.btn-primary`, `.field`, `.progress-fill`, `.hope-arc` 등
- 글꼴: Pretendard (본문), Noto Serif KR (성경 구절)
- 공유 미리보기(오픈 그래프) 이미지는 [`src/presentation/og/renderOgImage.tsx`](src/presentation/og/renderOgImage.tsx)에서 빌드 시 생성합니다.

## 데이터베이스

마이그레이션은 [`supabase/migrations/`](supabase/migrations)에 있으며 Supabase CLI로 적용합니다.

```bash
npx supabase login
npx supabase migration list --linked
npx supabase db push --linked
```

2026-11-01 시즌을 시작하며 기존 팀·계정·읽기 기록을 초기화했습니다.
이전 시즌 데이터는 DB의 `archive` 스키마(`season1_*` 테이블, 앱 API에 노출되지 않음)에 백업되어 있습니다.

## 카카오 로그인 설정 (요약)

- 카카오 개발자: 카카오 로그인 ON, 비즈 앱 전환, 동의항목(닉네임 필수 · 이메일/프로필 사진 선택),
  리다이렉트 URI `https://<프로젝트>.supabase.co/auth/v1/callback`
- Supabase: Kakao 공급자 켜기(REST API 키 · Client Secret), "Allow users without an email" 켜기,
  Redirect URLs에 `https://newhope-readbible.vercel.app/auth/callback` 추가
