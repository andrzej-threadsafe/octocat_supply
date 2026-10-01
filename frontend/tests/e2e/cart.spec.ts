import { test, expect } from '@playwright/test';

test.describe('Shopping cart', () => {
  test('adds a product, persists it on reload, and removes it', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('button[id^="add-to-cart-"]').first()).toBeVisible();

    await page.locator('button[id^="increase-qty-"]').first().click();
    await page.locator('button[id^="add-to-cart-"]').first().click();

    const cartLink = page.locator('nav a[aria-label^="Shopping cart"]');
    await expect(cartLink).toHaveAttribute('aria-label', 'Shopping cart, 1 item');
    await page.locator('button[id^="increase-qty-"]').first().click();
    await page.locator('button[id^="add-to-cart-"]').first().click();
    await expect(cartLink).toHaveAttribute('aria-label', 'Shopping cart, 2 items');
    await page.reload();
    await expect(page.locator('nav a[aria-label^="Shopping cart"]')).toHaveAttribute(
      'aria-label',
      'Shopping cart, 2 items',
    );

    await page.locator('nav a[aria-label^="Shopping cart"]').click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
    const cartRow = page.locator('tbody tr').first();
    await expect(cartRow).toBeVisible();
    await cartRow.getByRole('spinbutton', { name: /^Quantity of/ }).fill('3');
    await expect(page.locator('nav a[aria-label^="Shopping cart"]')).toHaveAttribute(
      'aria-label',
      'Shopping cart, 3 items',
    );
    await cartRow.getByRole('button', { name: /^Remove .* from cart$/ }).click();

    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.locator('nav a[aria-label^="Shopping cart"]')).toHaveAttribute(
      'aria-label',
      'Shopping cart, 0 items',
    );
  });
});
