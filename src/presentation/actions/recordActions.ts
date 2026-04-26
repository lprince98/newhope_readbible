"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/src/infrastructure/supabase/server";
import { SupabaseReadingRecordRepository } from "@/src/infrastructure/repositories/SupabaseReadingRecordRepository";
import { AddReadingRecordUseCase } from "@/src/application/use-cases/AddReadingRecordUseCase";
import type { BibleBookId } from "@/lib/constants/bible-books";

/**
 * 새로운 성경 읽기 기록을 추가합니다.
 * @param formData 성경(bookId), 시작 장, 종료 장, 메모 등을 포함한 폼 데이터
 */
export async function addReadingRecord(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // ── 데이터 정합성 검증 (성경별 최대 장수 확인) ──────────────────
  const { getBibleBook } = await import("@/lib/constants/bible-books");
  const bookInfo = getBibleBook(bookId);
  
  if (startChapter > bookInfo.chapters || endChapter > bookInfo.chapters) {
    return { 
      error: `${bookInfo.name}은(는) 총 ${bookInfo.chapters}장까지 있습니다. 입력값을 확인해주세요.` 
    };
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
      readAt: new Date(), // 한국 시간(KST) 조정을 위해 내부 로직에서 처리됨
    });

    // [중요] 모든 관련 페이지를 즉시 갱신(Revalidate)합니다.
    // 'layout'을 지정하여 하위 모든 페이지가 신선한 데이터를 가져오도록 강제합니다.
    revalidatePath("/", "layout");
    revalidatePath("/home");
    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    revalidatePath("/record");
    revalidatePath("/team");

    return { success: true, record };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "저장에 실패했습니다." };
  }
}

/**
 * 특정 읽기 기록을 삭제합니다.
 * @param id 삭제할 기록의 고유 ID
 */
export async function deleteReadingRecord(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const repo = new SupabaseReadingRecordRepository(supabase);
  try {
    await repo.deleteById(id, user.id);
    
    // 삭제 후 모든 관련 페이지 갱신
    revalidatePath("/", "layout");
    revalidatePath("/home");
    revalidatePath("/dashboard");
    revalidatePath("/ranking");
    revalidatePath("/record");
    revalidatePath("/team");

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "삭제에 실패했습니다." };
  }
}

/** 
 * 기존 읽기 기록을 수정합니다.
 * @param id 수정할 기록의 고유 ID
 * @param formData 수정된 폼 데이터
 */
export async function updateReadingRecord(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const bookId = formData.get("bookId") as BibleBookId;
  const startChapter = Number(formData.get("startChapter"));
  const endChapter = Number(formData.get("endChapter"));
  const memo = (formData.get("memo") as string) || undefined;

  // 정합성 검증
  const { getBibleBook } = await import("@/lib/constants/bible-books");
  const bookInfo = getBibleBook(bookId);
  if (startChapter > bookInfo.chapters || endChapter > bookInfo.chapters) {
    return { error: `${bookInfo.name}은(는) 총 ${bookInfo.chapters}장까지 있습니다.` };
  }

  const { error } = await supabase
    .from("reading_records")
    .update({
      book_id: bookId,
      start_chapter: startChapter,
      end_chapter: endChapter,
      memo: memo,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "기록 수정에 실패했습니다." };

  // 수정 후 모든 관련 페이지 갱신
  revalidatePath("/", "layout");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  revalidatePath("/record");
  revalidatePath("/team");

  return { success: true };
}
