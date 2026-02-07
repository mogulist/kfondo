"use server";

import { revalidatePath } from "next/cache";

export async function revalidateHomePage() {
  revalidatePath("/");
}

export async function revalidateEventPage(slug: string) {
  revalidatePath(`/${slug}`);
}
