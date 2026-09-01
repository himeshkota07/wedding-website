"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { syncKnowledgeBase } from "@/lib/knowledge-base";

export async function resyncKnowledgeBase() {
  await requireAdmin();
  await syncKnowledgeBase();
  revalidatePath("/admin");
}
