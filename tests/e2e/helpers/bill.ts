import type { Page } from '@playwright/test';

export interface DemoItem {
  name: string;
  price: string;
  discount?: string;
  tax?: string;
  /** Member names to include on this row. Defaults to every member. */
  members?: string[];
}

// Drives the real /split UI (add member, add item, fill fields, toggle
// member inclusion) rather than seeding localStorage — seeding races with
// the app's own load/save effects under React StrictMode in dev and gets
// silently clobbered, a real bug documented separately in this codebase.
export async function buildDemoBill(page: Page, members: string[], items: DemoItem[]) {
  await page.goto('/split');
  await page.waitForSelector('text=Item');

  for (const name of members) {
    await page.click('button:has-text("Member")');
    await page.fill('input[placeholder="Member name"]', name);
    await page.keyboard.press('Enter');
  }

  for (let i = 0; i < items.length; i++) {
    await page.click('button:has-text("Item")');
    const row = page.locator('table tbody tr').nth(i);
    const item = items[i];

    await row.locator('input').nth(0).fill(item.name);
    await row.locator('input').nth(2).fill(item.price);
    if (item.discount) await row.locator('input').nth(3).fill(item.discount);
    if (item.tax) await row.locator('input').nth(4).fill(item.tax);

    const includeMembers = item.members ?? members;
    // Member toggle buttons show a dollar amount, not the member's name
    // (the name only appears in the column header), so they're targeted
    // positionally in member-column order.
    const memberButtons = await row.locator('button', { hasText: '$' }).all();
    for (let m = 0; m < members.length; m++) {
      if (includeMembers.includes(members[m])) {
        await memberButtons[m].click();
      }
    }
  }

  await page.waitForTimeout(300);
}
