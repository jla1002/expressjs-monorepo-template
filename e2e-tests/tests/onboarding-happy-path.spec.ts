import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Onboarding Form - Happy Path Journey', () => {
  test('should complete the full onboarding journey successfully', async ({ page }) => {
    // Start page
    await page.goto('/onboarding/start');

    // Verify start page loads correctly
    await expect(page).toHaveTitle(/HMCTS Express Monorepo Template/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Start the form
    await page.getByRole('button', { name: /start now/i }).click();

    // Name page
    await expect(page).toHaveURL('/onboarding/name');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/name/i);

    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Smith');
    await page.getByRole('button', { name: /continue/i }).click();

    // Date of birth page
    await expect(page).toHaveURL('/onboarding/date-of-birth');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/date of birth/i);

    // Verify date fields are on the same row
    const dateFieldsContainer = page.locator('.govuk-date-input');
    await expect(dateFieldsContainer).toBeVisible();

    await page.getByLabel(/day/i).fill('15');
    await page.getByLabel(/month/i).fill('6');
    await page.getByLabel(/year/i).fill('1990');
    await page.getByRole('button', { name: /continue/i }).click();

    // Address page
    await expect(page).toHaveURL('/onboarding/address');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/address/i);

    await page.getByLabel(/address line 1/i).fill('123 Main Street');
    await page.getByLabel(/address line 2/i).fill('Apt 4B');
    await page.getByLabel(/town or city/i).fill('London');
    await page.getByLabel(/postcode/i).fill('SW1A 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    // Role page
    await expect(page).toHaveURL('/onboarding/role');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/role/i);

    // Select a predefined role first
    await page.getByRole('radio', { name: /developer/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Summary page
    await expect(page).toHaveURL('/onboarding/summary');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/summary/i);

    // Verify all entered data is displayed
    await expect(page.getByText('John')).toBeVisible();
    await expect(page.getByText('Smith')).toBeVisible();
    await expect(page.getByText('15 June 1990')).toBeVisible();
    await expect(page.getByText('123 Main Street')).toBeVisible();
    await expect(page.getByText('Apt 4B')).toBeVisible();
    await expect(page.getByText('London')).toBeVisible();
    await expect(page.getByText('SW1A 1AA')).toBeVisible();
    await expect(page.getByText(/developer/i)).toBeVisible();

    // Verify change links are present
    await expect(page.getByRole('link', { name: /change.*name/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*date of birth/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*address/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*role/i })).toBeVisible();

    // Submit the form
    await page.getByRole('button', { name: /submit/i }).click();

    // Confirmation page
    await expect(page).toHaveURL('/onboarding/confirmation');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/confirmation/i);
    await expect(page.getByText(/successfully submitted/i)).toBeVisible();

    // Verify confirmation panel is displayed
    await expect(page.locator('.govuk-panel--confirmation')).toBeVisible();
  });

  test('should handle "Other" role selection with text input', async ({ page }) => {
    // Navigate directly to role page for this test
    await page.goto('/onboarding/role');

    // Select "Other" option
    await page.getByRole('radio', { name: /other/i }).check();

    // Verify the conditional text field appears
    const otherRoleInput = page.getByLabel(/please specify/i);
    await expect(otherRoleInput).toBeVisible();

    // Fill in custom role
    await otherRoleInput.fill('Product Manager');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should proceed to next page successfully
    await expect(page).toHaveURL('/onboarding/summary');
  });

  test('should include accessibility checks throughout the journey', async ({ page }) => {
    const pagesToTest = [
      '/onboarding/start',
      '/onboarding/name',
      '/onboarding/date-of-birth',
      '/onboarding/address',
      '/onboarding/role'
    ];

    for (const pageUrl of pagesToTest) {
      await page.goto(pageUrl);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.govuk-footer__link') // Known template issue
        .exclude('.language') // Known template issue
        .analyze();

      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations found on ${pageUrl}:`);
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Affected nodes: ${violation.nodes.length}`);
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    }
  });

  test('should support keyboard navigation throughout the form', async ({ page }) => {
    await page.goto('/onboarding/start');

    // Test keyboard navigation on start page
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /start now/i })).toBeFocused();
    await page.keyboard.press('Enter');

    // Name page - keyboard navigation
    await expect(page).toHaveURL('/onboarding/name');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/first name/i)).toBeFocused();

    await page.keyboard.type('John');
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(/last name/i)).toBeFocused();

    await page.keyboard.type('Smith');

    // Find continue button and press Enter
    await page.keyboard.press('Tab');
    while (!(await page.getByRole('button', { name: /continue/i }).isVisible()) ||
           !(await page.getByRole('button', { name: /continue/i }).isFocused())) {
      await page.keyboard.press('Tab');
    }
    await page.keyboard.press('Enter');

    // Verify we moved to the next page
    await expect(page).toHaveURL('/onboarding/date-of-birth');
  });
});