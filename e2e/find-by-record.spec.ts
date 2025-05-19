import { test, expect } from "@playwright/test";

test("2025 홍천 메디오폰도 04132855 기록은 순위 496", async ({ page }) => {
  await page.goto("/find-by-record/hongcheon/mediofondo/2025/04132855");
  await expect(page.getByText("순위: 496위")).toBeVisible();
});

test("2025 홍천 그란폰도 05253137 기록은 순위 541", async ({ page }) => {
  await page.goto("/find-by-record/hongcheon/granfondo/2025/05253137");
  await expect(page.getByText("순위: 541위")).toBeVisible();
});

test("2025 양양 그란폰도 07124578 기록은 순위 389", async ({ page }) => {
  await page.goto("/find-by-record/yangyang/granfondo/2025/07124578");
  await expect(page.getByText("순위: 389위")).toBeVisible();
});

test("2025 양양 메디오폰도 03384028 기록은 순위 410", async ({ page }) => {
  await page.goto("/find-by-record/yangyang/mediofondo/2025/03384028");
  await expect(page.getByText("순위: 410위")).toBeVisible();
});

test("2024 홍천 그란폰도 05572155 기록은 순위 1162", async ({ page }) => {
  await page.goto("/find-by-record/hongcheon/granfondo/2024/05572155");
  await expect(page.getByText("순위: 1162위")).toBeVisible();
});

test("2024 홍천 메디오폰도 04230517 기록은 순위 525", async ({ page }) => {
  await page.goto("/find-by-record/hongcheon/mediofondo/2024/04230517");
  await expect(page.getByText("순위: 525위")).toBeVisible();
});

test("2024 양양 그란폰도 09074266 기록은 순위 786", async ({ page }) => {
  await page.goto("/find-by-record/yangyang/granfondo/2024/09074266");
  await expect(page.getByText("순위: 786위")).toBeVisible();
});

test("2024 양양 메디오폰도 02310257 기록은 순위 45", async ({ page }) => {
  await page.goto("/find-by-record/yangyang/mediofondo/2024/02310257");
  await expect(page.getByText("순위: 45위")).toBeVisible();
});
