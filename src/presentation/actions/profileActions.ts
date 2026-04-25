"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/infrastructure/supabase/server";

/** 사용자 하루 목표 장수 수정 */
export async function updateDailyGoal(goal: number) {
  if (goal < 1) return { error: "목표는 최소 1장 이상이어야 합니다." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ daily_goal: goal })
    .eq("id", user.id);

  if (error) {
    return { error: "목표 수정 중 오류가 발생했습니다." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/home");
  revalidatePath("/dashboard");

  
  return { success: true };
}
