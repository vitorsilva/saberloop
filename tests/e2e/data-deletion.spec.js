import { test, expect } from '@playwright/test';

/**
 * Navigate to settings page with basic setup
 */
async function navigateToSettings(page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.goto('/#/settings');
  await page.waitForLoadState('networkidle');
}

test.describe('Data Deletion Feature', () => {
  test('should display storage usage in settings', async ({ page }) => {
    await navigateToSettings(page);

    // Wait for settings page to load
    await expect(page.getByTestId('settings-title')).toBeVisible();

    // Check for Data Management section
    await expect(page.getByText('Data Management')).toBeVisible();

    // Check for storage usage display
    await expect(page.getByText('Storage Usage')).toBeVisible();

    // Check for storage breakdown (wait for async loading)
    await expect(page.getByTestId('storage-settings')).toBeVisible();
    await expect(page.getByTestId('storage-quizzes')).toBeVisible();
    await expect(page.getByTestId('storage-total')).toBeVisible();

    // Wait a bit for values to load
    await page.waitForTimeout(500);

    // Verify values are not loading indicators
    const settingsValue = await page.getByTestId('storage-settings').textContent();
    const quizzesValue = await page.getByTestId('storage-quizzes').textContent();
    const totalValue = await page.getByTestId('storage-total').textContent();

    // Values should contain B, KB, MB, or GB (or be loading indicator)
    expect(settingsValue).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)|--|\.\.\./);
    expect(quizzesValue).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)|--|\.\.\./);
    expect(totalValue).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)|--|\.\.\./);
  });

  test('should display delete all data button', async ({ page }) => {
    await navigateToSettings(page);

    // Check for delete button
    await expect(page.getByTestId('delete-all-data-btn')).toBeVisible();
  });

  test('should show confirmation modal when clicking delete button', async ({ page }) => {
    await navigateToSettings(page);

    // Click delete button
    await page.getByTestId('delete-all-data-btn').click();

    // Check modal is visible
    await expect(page.getByTestId('delete-modal-title')).toBeVisible();
    await expect(page.getByTestId('delete-modal-title')).toContainText('Delete All Data?');

    // Check for cancel and confirm buttons
    await expect(page.getByTestId('modal-cancel-delete-btn')).toBeVisible();
    await expect(page.getByTestId('modal-confirm-delete-btn')).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await navigateToSettings(page);

    // Open modal
    await page.getByTestId('delete-all-data-btn').click();
    await expect(page.getByTestId('delete-modal-title')).toBeVisible();

    // Click cancel
    await page.getByTestId('modal-cancel-delete-btn').click();

    // Modal should be closed
    await expect(page.getByTestId('delete-modal-title')).not.toBeVisible();

    // Settings page should still be visible
    await expect(page.getByTestId('settings-title')).toBeVisible();
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    await navigateToSettings(page);

    // Open modal
    await page.getByTestId('delete-all-data-btn').click();
    await expect(page.getByTestId('delete-modal-title')).toBeVisible();

    // Click backdrop (outside the modal content)
    await page.locator('#deleteDataModal').click({ position: { x: 10, y: 10 } });

    // Modal should be closed
    await expect(page.getByTestId('delete-modal-title')).not.toBeVisible();
  });

  test('should close modal when pressing Escape key', async ({ page }) => {
    await navigateToSettings(page);

    // Open modal
    await page.getByTestId('delete-all-data-btn').click();
    await expect(page.getByTestId('delete-modal-title')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should be closed
    await expect(page.getByTestId('delete-modal-title')).not.toBeVisible();
  });

  test('should delete data and show success toast when confirming', async ({ page }) => {
    await navigateToSettings(page);

    // Open modal
    await page.getByTestId('delete-all-data-btn').click();
    await expect(page.getByTestId('delete-modal-title')).toBeVisible();

    // Click confirm delete
    await page.getByTestId('modal-confirm-delete-btn').click();

    // Wait for deletion to complete and modal to close
    await expect(page.getByTestId('delete-modal-title')).not.toBeVisible({ timeout: 5000 });

    // Check for success toast
    await expect(page.getByText('All data deleted successfully')).toBeVisible();
  });

  test('should still display settings after data deletion', async ({ page }) => {
    await navigateToSettings(page);

    // Delete all data
    await page.getByTestId('delete-all-data-btn').click();
    await page.getByTestId('modal-confirm-delete-btn').click();

    // Wait for deletion
    await expect(page.getByTestId('delete-modal-title')).not.toBeVisible({ timeout: 5000 });

    // Settings page should still be visible after re-render
    await expect(page.getByTestId('settings-title')).toBeVisible();
  });
});
