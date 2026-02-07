"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateHomePage() {
  revalidatePath("/");
}

export async function revalidateEventPage(slug: string) {
  revalidateTag(`event-${slug}`, "default");
  revalidatePath(`/${slug}`);
}
