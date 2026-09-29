import { expect, test, type Page } from '@playwright/test';

const products = [
  {
    productId: 1,
    supplierId: 1,
    name: 'Cat Nap Feeder',
    description: 'An AI-powered cat feeder.',
    price: 49.99,
    sku: 'CAT-FEED-001',
    unit: 'piece',
    imgName: 'feeder.png',
  },
  {
    productId: 2,
    supplierId: 1,
    name: 'Feline Fit Mat',
    description: 'A smart activity mat for cats.',
    price: 50.01,
    sku: 'CAT-MAT-001',
    unit: 'piece',
    imgName: 'tracker-mat.png',
  },
  {
    productId: 3,
    supplierId: 1,
    name: 'Purrfect Fountain',
    description: 'A smart water fountain for cats.',
    price: 100.01,
    sku: 'CAT-FOUNTAIN-001',
    unit: 'piece',
    imgName: 'smart-fountain.png',
  },
];

async function addProduct(page: Page, productName: string, quantity: number) {
  const product = products.find(({ name }) => name === productName);
  if (!product) {
    throw new Error(`Unknown test product: ${productName}`);
  }

  const increaseButton = page.getByRole('button', {
    name: `Increase quantity of ${product.name}`,
  });
  for (let item = 0; item < quantity; item += 1) {
    await increaseButton.click();
  }

  const addButton = page.getByRole('button', {
    name: `Add ${quantity} ${product.name} to cart`,
  });
  await expect(addButton).toBeEnabled();
  await addButton.click();
}

async function openCart(page: Page) {
  const cartLink = page.locator('nav').getByRole('link', { name: /cart/i });
  await expect(cartLink).toBeVisible();
  await cartLink.click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { name: /cart/i }).first()).toBeVisible();
}

async function expectSummaryAmount(page: Page, label: string, amount: string) {
  const summary = page.getByRole('region', { name: /order summary/i });
  await expect(summary).toContainText(label);
  await expect(summary.getByText(amount, { exact: true })).toBeVisible();
}

test.describe('Shopping cart page', () => {
  let dialogs: string[];

  test.beforeEach(async ({ page }) => {
    dialogs = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await page.route('**/api/products', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(products),
      }),
    );
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cat Nap Feeder' })).toBeVisible();
  });

  test('shows an empty state and disables checkout when no products are in the cart', async ({
    page,
  }) => {
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /cart/i }).first()).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Your cart is empty');
    await expect(page.getByRole('button', { name: /checkout/i })).toBeDisabled();
  });

  test('adds products, updates the navigation count, and lists the cart contents', async ({
    page,
  }) => {
    await addProduct(page, 'Cat Nap Feeder', 2);
    await addProduct(page, 'Feline Fit Mat', 1);

    const cartLink = page.locator('nav').getByRole('link', { name: /cart/i });
    await expect(cartLink).toContainText('3');
    await openCart(page);

    await expect(page.getByText('Cat Nap Feeder', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Quantity of Cat Nap Feeder')).toHaveText('2');
    await expect(page.getByText('Feline Fit Mat', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Quantity of Feline Fit Mat')).toHaveText('1');
    expect(dialogs).toEqual([]);
  });

  test('updates item quantities and recalculates the subtotal, shipping, and total', async ({
    page,
  }) => {
    await addProduct(page, 'Cat Nap Feeder', 1);
    await openCart(page);

    await page.getByRole('button', { name: 'Increase quantity of Cat Nap Feeder' }).click();
    await expect(page.getByLabel('Quantity of Cat Nap Feeder')).toHaveText('2');
    await expectSummaryAmount(page, 'Subtotal', '$99.98');
    await expectSummaryAmount(page, 'Shipping', '$25.00');
    await expectSummaryAmount(page, 'Total', '$124.98');

    await page.getByRole('button', { name: 'Decrease quantity of Cat Nap Feeder' }).click();
    await expect(page.getByLabel('Quantity of Cat Nap Feeder')).toHaveText('1');
    await expectSummaryAmount(page, 'Subtotal', '$49.99');
    await expectSummaryAmount(page, 'Shipping', '$25.00');
    await expectSummaryAmount(page, 'Total', '$74.99');
  });

  test('charges shipping at and below $100 and waives it above $100', async ({ page }) => {
    await addProduct(page, 'Cat Nap Feeder', 1);
    await addProduct(page, 'Feline Fit Mat', 1);
    await openCart(page);

    await expectSummaryAmount(page, 'Subtotal', '$100.00');
    await expectSummaryAmount(page, 'Shipping', '$25.00');
    await expectSummaryAmount(page, 'Total', '$125.00');

    await page.getByRole('button', { name: 'Increase quantity of Feline Fit Mat' }).click();
    await expectSummaryAmount(page, 'Subtotal', '$150.01');
    await expectSummaryAmount(page, 'Shipping', '$0.00');
    await expectSummaryAmount(page, 'Total', '$150.01');
  });

  test('waives shipping when the subtotal is one cent above $100', async ({ page }) => {
    await addProduct(page, 'Purrfect Fountain', 1);
    await openCart(page);

    await expectSummaryAmount(page, 'Subtotal', '$100.01');
    await expectSummaryAmount(page, 'Shipping', '$0.00');
    await expectSummaryAmount(page, 'Total', '$100.01');
  });

  test('removes individual items and returns to the empty state after removing the last item', async ({
    page,
  }) => {
    await addProduct(page, 'Cat Nap Feeder', 1);
    await addProduct(page, 'Feline Fit Mat', 1);
    await openCart(page);

    await page.getByRole('button', { name: 'Remove Cat Nap Feeder from cart' }).click();
    await expect(page.getByText('Cat Nap Feeder', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Feline Fit Mat', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Remove Feline Fit Mat from cart' }).click();
    await expect(page.getByRole('status')).toContainText('Your cart is empty');
    await expect(page.getByRole('button', { name: /checkout/i })).toBeDisabled();
  });

  test('persists cart contents after reloading the cart page', async ({ page }) => {
    await addProduct(page, 'Cat Nap Feeder', 2);
    await openCart(page);
    await page.reload();

    await expect(page.getByRole('heading', { name: /cart/i }).first()).toBeVisible();
    await expect(page.getByText('Cat Nap Feeder', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Quantity of Cat Nap Feeder')).toHaveText('2');
  });

  test('supports keyboard activation of cart quantity controls', async ({ page }) => {
    await addProduct(page, 'Cat Nap Feeder', 1);
    await openCart(page);

    const increaseButton = page.getByRole('button', {
      name: 'Increase quantity of Cat Nap Feeder',
    });
    await increaseButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByLabel('Quantity of Cat Nap Feeder')).toHaveText('2');
  });

  test('keeps cart items and the order summary visible on a mobile-sized screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await addProduct(page, 'Cat Nap Feeder', 1);
    await openCart(page);

    await expect(page.getByText('Cat Nap Feeder', { exact: true })).toBeVisible();
    await expect(page.getByRole('region', { name: /order summary/i })).toBeVisible();
  });
});
