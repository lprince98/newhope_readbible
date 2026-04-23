import { redirect } from "next/navigation";

// 루트 경로는 (main) 그룹의 홈으로 리다이렉트
export default function RootPage() {
  redirect("/home");
}
