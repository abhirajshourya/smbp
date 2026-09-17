import { test, expect } from '@playwright/test';
import { buildDemoBill } from './helpers/bill';
import { captureRowAlignment, keyFor } from './helpers/canvasInk';

// Tolerance for how far apart (in canvas pixels) a row's two text runs'
// ink-weighted vertical centers may sit before we call it misaligned.
// Genuinely aligned baseline-set text lands within ~1px; this leaves enough
// room for anti-aliasing noise without masking a real several-pixel drift.
const ALIGNMENT_TOLERANCE_PX = 2;

test('brand mark and wordmark share a vertical center', async ({ page }) => {
  await buildDemoBill(page, ['Alex'], [{ name: 'Dinner', price: '20', tax: '8' }]);

  const [result] = await captureRowAlignment(page, [
    { row: 'Brand', leftKey: keyFor('brand-mark'), rightKey: keyFor('brand-name') },
  ]);

  expect(result.delta, `Brand row misaligned by ${result.delta.toFixed(1)}px`).toBeLessThanOrEqual(
    ALIGNMENT_TOLERANCE_PX
  );
});

test('total label and amount share a baseline', async ({ page }) => {
  await buildDemoBill(page, ['Alex'], [{ name: 'Dinner', price: '20', tax: '8' }]);

  const [result] = await captureRowAlignment(page, [
    { row: 'Total', leftKey: keyFor('total-label'), rightKey: keyFor('total-amount') },
  ]);

  expect(result.delta, `Total row misaligned by ${result.delta.toFixed(1)}px`).toBeLessThanOrEqual(
    ALIGNMENT_TOLERANCE_PX
  );
});

for (const memberCount of [1, 3, 6]) {
  test(`each member row's name and amount share a baseline (${memberCount} members)`, async ({ page }) => {
    const members = Array.from({ length: memberCount }, (_, i) => `Member${i + 1}`);
    await buildDemoBill(page, members, [{ name: 'Dinner', price: '100', tax: '8' }]);

    const rows = members.map((name) => ({
      row: name,
      leftKey: keyFor('member-name', name),
      rightKey: keyFor('member-amount', name),
    }));
    const results = await captureRowAlignment(page, rows);

    for (const result of results) {
      expect(
        result.delta,
        `Row "${result.row}" misaligned by ${result.delta.toFixed(1)}px (${memberCount}-member bill)`
      ).toBeLessThanOrEqual(ALIGNMENT_TOLERANCE_PX);
    }
  });
}
