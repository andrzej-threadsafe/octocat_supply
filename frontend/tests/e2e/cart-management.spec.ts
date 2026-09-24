import { test, expect, type Page } from '@playwright/test';

/**
 * Cart quantity management E2E tests
 * Implements: frontend/tests/features/cart-management.feature
 */

const productName = 'SmartFeeder One';

const productCard = (page: Page, name: string) =>
  page
    .locator('article, div')
    .filter({ has: page.getByRole('heading', { name, exact: true }) })
    .filter({ has: page.getByRole('button', { name: 'Add to Cart' }) })
    .first();

const quantityDisplay = (page: Page, name: string) =>
  productCard(page, name).locator(`[aria-label="Quantity of ${name}"]`);

const increaseButton = (page: Page, name: string) =>
  productCard(page, name).getByRole('button', { name: `Increase quantity of ${name}` });

const decreaseButton = (page: Page, name: string) =>
  productCard(page, name).getByRole('button', { name: `Decrease quantity of ${name}` });

const addToCartButton = (page: Page, name: string) =>
  productCard(page, name).getByRole('button', { name: 'Add to Cart' });

async function openProducts(page: Page) {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(productCard(page, productName)).toBeVisible();
}

async function setQuantity(page: Page, name: string, quantity: number) {
  const increase = increaseButton(page, name);
  for (let i = 0; i < quantity; i += 1) {
    await increase.click();
  }
}

test.describe('Cart quantity management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Increase quantity and add product to cart', async ({ page }) => {
    await openProducts(page);

    await setQuantity(page, productName, 2);
    await expect(quantityDisplay(page, productName)).toHaveText('2');
    await expect(addToCartButton(page, productName)).toBeEnabled();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Added 2 items to cart');
      await dialog.accept();
    });
    await addToCartButton(page, productName).click();

    await expect(quantityDisplay(page, productName)).toHaveText('0');
    await expect(addToCartButton(page, productName)).toBeDisabled();
  });

  test('Quantity cannot go below zero', async ({ page }) => {
    await openProducts(page);

    await expect(quantityDisplay(page, productName)).toHaveText('0');
    await expect(addToCartButton(page, productName)).toBeDisabled();

    await decreaseButton(page, productName).click();
    await expect(quantityDisplay(page, productName)).toHaveText('0');
    await expect(addToCartButton(page, productName)).toBeDisabled();
  });

  test('Add to cart button enables only when quantity is greater than zero', async ({ page }) => {
    await openProducts(page);

    await expect(addToCartButton(page, productName)).toBeDisabled();

    await increaseButton(page, productName).click();
    await expect(quantityDisplay(page, productName)).toHaveText('1');
    await expect(addToCartButton(page, productName)).toBeEnabled();
  });

  test('Keyboard-only add to cart interaction', async ({ page }) => {
    await openProducts(page);

    await increaseButton(page, productName).focus();
    await expect(increaseButton(page, productName)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(quantityDisplay(page, productName)).toHaveText('1');
    await expect(addToCartButton(page, productName)).toBeEnabled();

    await addToCartButton(page, productName).focus();
    await expect(addToCartButton(page, productName)).toBeFocused();
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Added 1 items to cart');
      await dialog.accept();
    });
    await page.keyboard.press('Enter');

    await expect(quantityDisplay(page, productName)).toHaveText('0');
    await expect(addToCartButton(page, productName)).toBeDisabled();
  });
});
