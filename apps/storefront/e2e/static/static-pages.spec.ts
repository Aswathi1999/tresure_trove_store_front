import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// About page — structure
// ---------------------------------------------------------------------------

test.describe('About page — structure', () => {
  test('renders the about-page container', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByTestId('about-page')).toBeVisible()
  })

  test('page title contains About and Treasure Trove', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveTitle(/About.*Treasure Trove/i)
  })

  test('breadcrumb shows Home and About', async ({ page }) => {
    await page.goto('/about')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByText('About')).toBeVisible()
  })

  test('hero section is visible', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByTestId('about-hero')).toBeVisible()
  })

  test('renders at least one story section', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByTestId('about-section-0')).toBeVisible()
  })

  test('stats strip renders with stat values', async ({ page }) => {
    await page.goto('/about')
    const stats = page.getByTestId('about-stats')
    await expect(stats).toBeVisible()
    await expect(page.getByTestId('about-stat-value-0')).toBeVisible()
  })

  test('newsletter section is present', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByTestId('about-newsletter')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Craftsmanship page — structure
// ---------------------------------------------------------------------------

test.describe('Craftsmanship page — structure', () => {
  test('renders the craftsmanship-page container', async ({ page }) => {
    await page.goto('/craftsmanship')
    await expect(page.getByTestId('craftsmanship-page')).toBeVisible()
  })

  test('page title contains Craftsmanship and Treasure Trove', async ({ page }) => {
    await page.goto('/craftsmanship')
    await expect(page).toHaveTitle(/Craftsmanship.*Treasure Trove/i)
  })

  test('breadcrumb shows Home and Craftsmanship', async ({ page }) => {
    await page.goto('/craftsmanship')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByText('Craftsmanship')).toBeVisible()
  })

  test('hero section is visible with a heading', async ({ page }) => {
    await page.goto('/craftsmanship')
    await expect(page.getByTestId('craftsmanship-hero')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('process steps container renders', async ({ page }) => {
    await page.goto('/craftsmanship')
    await expect(page.getByTestId('craftsmanship-steps')).toBeVisible()
  })

  test('renders at least 4 process steps', async ({ page }) => {
    await page.goto('/craftsmanship')
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`craftsmanship-step-${i}`)).toBeVisible()
    }
  })

  test('CTA section renders', async ({ page }) => {
    await page.goto('/craftsmanship')
    await expect(page.getByTestId('craftsmanship-cta')).toBeVisible()
  })

  test('materials link points to /materials', async ({ page }) => {
    await page.goto('/craftsmanship')
    const link = page.getByTestId('craftsmanship-materials-link')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/materials')
  })
})

// ---------------------------------------------------------------------------
// Contact page — structure
// ---------------------------------------------------------------------------

test.describe('Contact page — structure', () => {
  test('renders the contact-page container', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByTestId('contact-page')).toBeVisible()
  })

  test('page title contains Contact and Treasure Trove', async ({ page }) => {
    await page.goto('/contact')
    await expect(page).toHaveTitle(/Contact.*Treasure Trove/i)
  })

  test('breadcrumb shows Home and Contact', async ({ page }) => {
    await page.goto('/contact')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByText('Contact')).toBeVisible()
  })

  test('form section renders', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByTestId('contact-form-section')).toBeVisible()
    await expect(page.getByTestId('contact-form-wrapper')).toBeVisible()
  })

  test('info section renders with contact cards', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByTestId('contact-info-section')).toBeVisible()
    await expect(page.getByTestId('contact-visit')).toBeVisible()
    await expect(page.getByTestId('contact-email')).toBeVisible()
  })

  test('all required form fields are present', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByTestId('contact-name-input')).toBeVisible()
    await expect(page.getByTestId('contact-email-input')).toBeVisible()
    await expect(page.getByTestId('contact-subject-input')).toBeVisible()
    await expect(page.getByTestId('contact-message-input')).toBeVisible()
  })

  test('submit button is present and enabled by default', async ({ page }) => {
    await page.goto('/contact')
    const btn = page.getByTestId('contact-submit-button')
    await expect(btn).toBeVisible()
    await expect(btn).not.toBeDisabled()
  })

  test('optional phone field is present', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByTestId('contact-phone-input')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Contact page — form validation
// ---------------------------------------------------------------------------

test.describe('Contact page — form validation', () => {
  test('shows name error when submitted with empty name', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-name-error')).toBeVisible()
    await expect(page.getByTestId('contact-name-error')).toHaveText(/required/i)
  })

  test('shows email error when submitted with empty email', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-email-error')).toBeVisible()
    await expect(page.getByTestId('contact-email-error')).toHaveText(/required/i)
  })

  test('shows email error for invalid email format', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Test User')
    await page.getByTestId('contact-email-input').fill('not-an-email')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-email-error')).toBeVisible()
    await expect(page.getByTestId('contact-email-error')).toHaveText(/valid email/i)
  })

  test('shows subject error when no subject selected', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-subject-error')).toBeVisible()
    await expect(page.getByTestId('contact-subject-error')).toHaveText(/subject/i)
  })

  test('shows message error when message is too short', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-message-input').fill('Too short')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-message-error')).toBeVisible()
    await expect(page.getByTestId('contact-message-error')).toHaveText(/20 characters/i)
  })

  test('shows multiple validation errors simultaneously on empty submit', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-name-error')).toBeVisible()
    await expect(page.getByTestId('contact-email-error')).toBeVisible()
    await expect(page.getByTestId('contact-subject-error')).toBeVisible()
  })

  test('clears error after correcting the field and resubmitting', async ({ page }) => {
    await page.goto('/contact')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-name-error')).toBeVisible()
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-submit-button').click()
    await expect(page.getByTestId('contact-name-error')).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Contact page — successful submission (API mocked)
// ---------------------------------------------------------------------------

test.describe('Contact page — successful submission', () => {
  test('shows loading spinner and disables button during submission', async ({ page }) => {
    // Intercept the API call and delay response to observe loading state
    await page.route('**/store/contact', async (route) => {
      await new Promise((r) => setTimeout(r, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Your message has been received.' }),
      })
    })

    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-email-input').fill('jane@example.com')
    await page.getByTestId('contact-subject-input').selectOption('product')
    await page
      .getByTestId('contact-message-input')
      .fill('I am interested in your teak dining table collection.')
    await page.getByTestId('contact-submit-button').click()

    await expect(page.getByTestId('contact-submit-spinner')).toBeVisible()
    await expect(page.getByTestId('contact-submit-button')).toBeDisabled()
  })

  test('shows success state after valid submission', async ({ page }) => {
    await page.route('**/store/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Your message has been received.' }),
      }),
    )

    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-email-input').fill('jane@example.com')
    await page.getByTestId('contact-subject-input').selectOption('product')
    await page
      .getByTestId('contact-message-input')
      .fill('I am interested in your teak dining table collection.')
    await page.getByTestId('contact-submit-button').click()

    await expect(page.getByTestId('contact-form-success')).toBeVisible()
    await expect(page.getByText(/Message Sent/i)).toBeVisible()
  })

  test('hides the form after successful submission', async ({ page }) => {
    await page.route('**/store/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Your message has been received.' }),
      }),
    )

    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-email-input').fill('jane@example.com')
    await page.getByTestId('contact-subject-input').selectOption('product')
    await page
      .getByTestId('contact-message-input')
      .fill('I am interested in your teak dining table collection.')
    await page.getByTestId('contact-submit-button').click()

    await expect(page.getByTestId('contact-form')).not.toBeVisible()
    await expect(page.getByTestId('contact-form-success')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Contact page — API error handling
// ---------------------------------------------------------------------------

test.describe('Contact page — API error handling', () => {
  test('shows error alert when API returns 400', async ({ page }) => {
    await page.route('**/store/contact', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid email address provided.' },
        }),
      }),
    )

    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-email-input').fill('jane@example.com')
    await page.getByTestId('contact-subject-input').selectOption('product')
    await page
      .getByTestId('contact-message-input')
      .fill('I am interested in your teak dining table collection.')
    await page.getByTestId('contact-submit-button').click()

    await expect(page.getByTestId('contact-submit-error')).toBeVisible()
    await expect(page.getByTestId('contact-submit-error')).toHaveText(/Invalid email address/i)
  })

  test('re-enables submit button after API error', async ({ page }) => {
    await page.route('**/store/contact', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false }),
      }),
    )

    await page.goto('/contact')
    await page.getByTestId('contact-name-input').fill('Jane Doe')
    await page.getByTestId('contact-email-input').fill('jane@example.com')
    await page.getByTestId('contact-subject-input').selectOption('product')
    await page
      .getByTestId('contact-message-input')
      .fill('I am interested in your teak dining table collection.')
    await page.getByTestId('contact-submit-button').click()

    await expect(page.getByTestId('contact-submit-error')).toBeVisible()
    await expect(page.getByTestId('contact-submit-button')).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Custom 404 page
// ---------------------------------------------------------------------------

test.describe('Custom 404 page', () => {
  test('non-existent route returns a 404 response', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz-abc-999')
    expect(response?.status()).toBe(404)
  })

  test('renders the not-found-page container', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    await expect(page.getByTestId('not-found-page')).toBeVisible()
  })

  test('renders the 404 eyebrow and branded heading', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    await expect(page.getByTestId('not-found-eyebrow')).toBeVisible()
    await expect(page.getByTestId('not-found-heading')).toBeVisible()
    const heading = await page.getByTestId('not-found-heading').textContent()
    expect(heading?.trim().length).toBeGreaterThan(0)
  })

  test('body text is present', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    await expect(page.getByTestId('not-found-body')).toBeVisible()
  })

  test('CTA container renders with both links', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    await expect(page.getByTestId('not-found-ctas')).toBeVisible()
    await expect(page.getByTestId('not-found-home-link')).toBeVisible()
    await expect(page.getByTestId('not-found-shop-link')).toBeVisible()
  })

  test('home link navigates to /', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    const homeLink = page.getByTestId('not-found-home-link')
    await expect(homeLink).toHaveAttribute('href', '/')
  })

  test('shop link navigates to /products', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    const shopLink = page.getByTestId('not-found-shop-link')
    await expect(shopLink).toHaveAttribute('href', '/products')
  })

  test('clicking home link navigates to homepage', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz-abc-999')
    await page.getByTestId('not-found-home-link').click()
    await expect(page).toHaveURL('/')
  })
})
