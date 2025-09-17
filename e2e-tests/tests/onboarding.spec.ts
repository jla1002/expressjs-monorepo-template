import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Onboarding Form', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session data
    await page.goto('/');
    await page.context().clearCookies();
  });

  test('onboarding flow - happy path with accessibility checks', async ({ page }) => {
    // Start from homepage - check for "See example form" button
    await page.goto('/');
    await expect(page.getByRole('button', { name: /see example form/i })).toBeVisible();

    // Navigate to onboarding
    await page.getByRole('button', { name: /see example form/i }).click();
    await expect(page).toHaveURL('/onboarding/name');

    // Step 1: Name page
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/what is your name/i);

    // Run accessibility check on name page
    const namePageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(namePageA11y.violations).toEqual([]);

    // Fill in name form
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Smith');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2: Date of birth page
    await expect(page).toHaveURL('/onboarding/date-of-birth');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/what is your date of birth/i);

    // Check back link is present and works
    await expect(page.getByRole('link', { name: /back/i })).toBeVisible();

    // Run accessibility check on date of birth page
    const dobPageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(dobPageA11y.violations).toEqual([]);

    // Fill in date of birth (making person over 18)
    await page.fill('#day', '15');
    await page.fill('#month', '6');
    await page.fill('#year', '1990');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3: Address page
    await expect(page).toHaveURL('/onboarding/address');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/what is your address/i);

    // Run accessibility check on address page
    const addressPageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(addressPageA11y.violations).toEqual([]);

    // Fill in address
    await page.fill('#address1', '123 Test Street');
    await page.fill('#address2', 'Apartment 4B');
    await page.fill('#townCity', 'London');
    await page.fill('#county', 'Greater London');
    await page.fill('#postcode', 'SW1A 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 4: Role page
    await expect(page).toHaveURL('/onboarding/role');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/what is your role/i);

    // Run accessibility check on role page
    const rolePageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(rolePageA11y.violations).toEqual([]);

    // Select a role
    await page.getByRole('radio', { name: /frontend developer/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 5: Summary page
    await expect(page).toHaveURL('/onboarding/summary');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/check your answers/i);

    // Verify all data is displayed correctly
    await expect(page.getByText('John Smith')).toBeVisible();
    await expect(page.getByText('15 June 1990')).toBeVisible();
    await expect(page.getByText('123 Test Street')).toBeVisible();
    await expect(page.getByText('Frontend Developer')).toBeVisible();

    // Check for change links
    await expect(page.getByRole('link', { name: /change.*name/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*date of birth/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*address/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /change.*role/i })).toBeVisible();

    // Run accessibility check on summary page
    const summaryPageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(summaryPageA11y.violations).toEqual([]);

    // Submit the form
    await page.getByRole('button', { name: /submit/i }).click();

    // Step 6: Confirmation page
    await expect(page).toHaveURL('/onboarding/confirmation');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/onboarding complete/i);

    // Check for reference number (format: NNNN-NNNN-NNNN-NNNN)
    await expect(page.getByText(/reference number/i)).toBeVisible();
    await expect(page.locator('text=/\\d{4}-\\d{4}-\\d{4}-\\d{4}/')).toBeVisible();

    // Run accessibility check on confirmation page
    const confirmationPageA11y = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(confirmationPageA11y.violations).toEqual([]);
  });

  test('back button navigation throughout the form', async ({ page }) => {
    // Start the form
    await page.goto('/onboarding/name');

    // Fill name and continue
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.getByRole('button', { name: /continue/i }).click();

    // On date of birth page, click back
    await expect(page).toHaveURL('/onboarding/date-of-birth');
    await page.getByRole('link', { name: /back/i }).click();

    // Should be back on name page with data preserved
    await expect(page).toHaveURL('/onboarding/name');
    await expect(page.locator('#firstName')).toHaveValue('Test');
    await expect(page.locator('#lastName')).toHaveValue('User');

    // Continue through flow again
    await page.getByRole('button', { name: /continue/i }).click();
    await page.fill('#day', '1');
    await page.fill('#month', '1');
    await page.fill('#year', '1990');
    await page.getByRole('button', { name: /continue/i }).click();

    // On address page, click back
    await expect(page).toHaveURL('/onboarding/address');
    await page.getByRole('link', { name: /back/i }).click();

    // Should be back on date of birth page with data preserved
    await expect(page).toHaveURL('/onboarding/date-of-birth');
    await expect(page.locator('#day')).toHaveValue('1');
    await expect(page.locator('#month')).toHaveValue('1');
    await expect(page.locator('#year')).toHaveValue('1990');
  });

  test('change links from summary page', async ({ page }) => {
    // Complete the form up to summary
    await page.goto('/onboarding/name');
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Doe');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('#day', '10');
    await page.fill('#month', '5');
    await page.fill('#year', '1985');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('#address1', '456 Test Road');
    await page.fill('#townCity', 'Birmingham');
    await page.fill('#postcode', 'B1 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('radio', { name: /backend developer/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    // On summary page, click change name link
    await expect(page).toHaveURL('/onboarding/summary');
    await page.getByRole('link', { name: /change.*name/i }).click();

    // Should be on name page with data preserved
    await expect(page).toHaveURL('/onboarding/name');
    await expect(page.locator('#firstName')).toHaveValue('John');
    await expect(page.locator('#lastName')).toHaveValue('Doe');

    // Change the name and continue
    await page.fill('#firstName', 'Jane');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should be back on summary page with updated data
    await expect(page).toHaveURL('/onboarding/summary');
    await expect(page.getByText('Jane Doe')).toBeVisible();

    // Test address change link
    await page.getByRole('link', { name: /change.*address/i }).click();
    await expect(page).toHaveURL('/onboarding/address');
    await expect(page.locator('#address1')).toHaveValue('456 Test Road');

    // Change postcode and continue
    await page.fill('#postcode', 'B2 2BB');
    await page.getByRole('button', { name: /continue/i }).click();

    // Should be back on summary with updated address
    await expect(page).toHaveURL('/onboarding/summary');
    await expect(page.getByText('B2 2BB')).toBeVisible();
  });

  test('form validation for each field', async ({ page }) => {
    // Test name validation
    await page.goto('/onboarding/name');
    await page.getByRole('button', { name: /continue/i }).click();

    // Check for validation errors
    await expect(page.getByText(/enter your first name/i)).toBeVisible();
    await expect(page.getByText(/enter your last name/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /there is a problem/i })).toBeVisible();

    // Test invalid characters in name
    await page.fill('#firstName', 'John123');
    await page.fill('#lastName', 'Smith@');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/name must only include letters/i)).toBeVisible();

    // Test date of birth validation
    await page.fill('#firstName', 'John');
    await page.fill('#lastName', 'Smith');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/enter a day/i)).toBeVisible();
    await expect(page.getByText(/enter a month/i)).toBeVisible();
    await expect(page.getByText(/enter a year/i)).toBeVisible();

    // Test invalid date
    await page.fill('#day', '32');
    await page.fill('#month', '13');
    await page.fill('#year', '1800');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/day must be between 1 and 31/i)).toBeVisible();
    await expect(page.getByText(/month must be between 1 and 12/i)).toBeVisible();

    // Test age restriction (under 16)
    await page.fill('#day', '1');
    await page.fill('#month', '1');
    await page.fill('#year', '2020');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/you must be at least 16 years old/i)).toBeVisible();

    // Fix date and continue to address
    await page.fill('#year', '1990');
    await page.getByRole('button', { name: /continue/i }).click();

    // Test address validation
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/enter address line 1/i)).toBeVisible();
    await expect(page.getByText(/enter town or city/i)).toBeVisible();
    await expect(page.getByText(/enter postcode/i)).toBeVisible();

    // Test invalid postcode
    await page.fill('#address1', '123 Test Street');
    await page.fill('#townCity', 'London');
    await page.fill('#postcode', 'INVALID');
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText(/enter a real postcode/i)).toBeVisible();

    // Fix postcode and continue to role
    await page.fill('#postcode', 'SW1A 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    // Test role validation
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/select your role/i)).toBeVisible();
  });

  test('Other role field conditional display', async ({ page }) => {
    // Navigate to role page
    await page.goto('/onboarding/name');
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('#day', '1');
    await page.fill('#month', '1');
    await page.fill('#year', '1990');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.fill('#address1', '123 Test Street');
    await page.fill('#townCity', 'London');
    await page.fill('#postcode', 'SW1A 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    // On role page, Other field should not be visible initially
    await expect(page.locator('#otherRole')).not.toBeVisible();

    // Select "Other" radio button
    await page.getByRole('radio', { name: /other/i }).check();

    // Now Other field should be visible
    await expect(page.locator('#otherRole')).toBeVisible();

    // Try to continue without filling Other field
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText(/enter your role/i)).toBeVisible();

    // Fill Other field and continue
    await page.fill('#otherRole', 'DevOps Engineer');
    await page.getByRole('button', { name: /continue/i }).click();

    // On summary page, should show "Other: DevOps Engineer"
    await expect(page).toHaveURL('/onboarding/summary');
    await expect(page.getByText('DevOps Engineer')).toBeVisible();

    // Select a different role
    await page.getByRole('link', { name: /change.*role/i }).click();
    await page.getByRole('radio', { name: /frontend developer/i }).check();

    // Other field should be hidden again
    await expect(page.locator('#otherRole')).not.toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();

    // Summary should show "Frontend Developer"
    await expect(page.getByText('Frontend Developer')).toBeVisible();
    await expect(page.getByText('DevOps Engineer')).not.toBeVisible();
  });

  test('session persistence across page refreshes', async ({ page }) => {
    // Start form and fill first step
    await page.goto('/onboarding/name');
    await page.fill('#firstName', 'Session');
    await page.fill('#lastName', 'Test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill second step
    await page.fill('#day', '15');
    await page.fill('#month', '8');
    await page.fill('#year', '1988');
    await page.getByRole('button', { name: /continue/i }).click();

    // Refresh the page
    await page.reload();

    // Should still be on address page
    await expect(page).toHaveURL('/onboarding/address');

    // Go back to check data is preserved
    await page.getByRole('link', { name: /back/i }).click();
    await expect(page.locator('#day')).toHaveValue('15');
    await expect(page.locator('#month')).toHaveValue('8');
    await expect(page.locator('#year')).toHaveValue('1988');

    // Go back further to check name is preserved
    await page.getByRole('link', { name: /back/i }).click();
    await expect(page.locator('#firstName')).toHaveValue('Session');
    await expect(page.locator('#lastName')).toHaveValue('Test');

    // Continue through flow to completion
    await page.getByRole('button', { name: /continue/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Fill address
    await page.fill('#address1', '789 Session Street');
    await page.fill('#townCity', 'Manchester');
    await page.fill('#postcode', 'M1 1AA');
    await page.getByRole('button', { name: /continue/i }).click();

    // Refresh on role page
    await page.reload();
    await expect(page).toHaveURL('/onboarding/role');

    // Complete and verify all data is on summary
    await page.getByRole('radio', { name: /test engineer/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText('Session Test')).toBeVisible();
    await expect(page.getByText('15 August 1988')).toBeVisible();
    await expect(page.getByText('789 Session Street')).toBeVisible();
    await expect(page.getByText('Test Engineer')).toBeVisible();
  });

  test('prevents skipping steps by direct URL access', async ({ page }) => {
    // Try to access summary page directly without completing previous steps
    await page.goto('/onboarding/summary');

    // Should redirect to first step
    await expect(page).toHaveURL('/onboarding/name');

    // Fill name and try to skip to summary
    await page.fill('#firstName', 'Skip');
    await page.fill('#lastName', 'Test');
    await page.getByRole('button', { name: /continue/i }).click();

    // Try to access role page directly
    await page.goto('/onboarding/role');

    // Should redirect to next required step (date of birth)
    await expect(page).toHaveURL('/onboarding/date-of-birth');

    // Complete date of birth and try to skip to confirmation
    await page.fill('#day', '5');
    await page.fill('#month', '3');
    await page.fill('#year', '1995');
    await page.getByRole('button', { name: /continue/i }).click();

    await page.goto('/onboarding/confirmation');

    // Should redirect to next required step (address)
    await expect(page).toHaveURL('/onboarding/address');
  });
});