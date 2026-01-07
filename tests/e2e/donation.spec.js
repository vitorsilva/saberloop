import { test, expect } from '@playwright/test';
import { setupAuthenticatedState } from './helpers.js';

test.describe('Donation Support', () => {
  test('should display donation link in Settings page', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/settings');

    // Wait for Settings page to load
    await expect(page.getByTestId('settings-title')).toBeVisible();

    // Scroll to bottom to see Support section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check donation link is visible
    const donationLink = page.getByTestId('donation-link');
    await expect(donationLink).toBeVisible();

    // Check link attributes
    await expect(donationLink).toHaveAttribute('href', 'https://liberapay.com/vitormrsilva');
    await expect(donationLink).toHaveAttribute('target', '_blank');
    await expect(donationLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Check button text
    await expect(donationLink).toContainText('Liberapay');
  });

  test('should display Support section header', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/settings');

    // Wait for Settings page to load
    await expect(page.getByTestId('settings-title')).toBeVisible();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check Support section title is visible
    await expect(page.locator('h2:has-text("Support Development")')).toBeVisible();
  });

  test('should display donation link in all supported languages', async ({ page }) => {
    await setupAuthenticatedState(page);
    await page.goto('/#/settings');

    // Wait for Settings page to load
    await expect(page.getByTestId('settings-title')).toBeVisible();

    // Test Portuguese
    await page.selectOption('#languageSelect', 'pt-PT');
    await page.waitForTimeout(500);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check Portuguese text
    await expect(page.locator('h2:has-text("Apoiar o Desenvolvimento")')).toBeVisible();
    await expect(page.getByTestId('donation-link')).toContainText('Liberapay');
  });
});
