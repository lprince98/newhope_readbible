"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { AddReadingRecordUseCase } from "@/src/application/use-cases/AddReadingRecordUseCase";
import type { BibleBookId } from "@/lib/constants/bible-books";

export async function addReadingRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const bookId = formData.get("bookId") as BibleBookId;
  const startChapter = Number(formData.get("startChapter"));
  const endChapter = Number(formData.get("endChapter"));
  const memo = (formData.get("memo") as string) || undefined;

  if (!bookId || !startChapter || !endChapter) {
    return { error: "성경, 시작 장, 종료 장을 모두 입력해주세요." };
  }

  const repo = new SupabaseReadingRecordRepository(supabase);
  const useCase = new AddReadingRecordUseCase(repo);

  try {
    const record = await useCase.execute({
      userId: user.id,
      bookId,
      startChapter,
      endChapter,
      memo,
      readAt: new Date(),
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/ranking");

    return { success: true, record };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "저장에 실패했습니다." };
  }
}

export async function deleteReadingRecord(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const repo = new SupabaseReadingRecordRepository(supabase);
  try {
    await repo.deleteById(id, user.id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "삭제에 실패했습니다." };
  }
}
