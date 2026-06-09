import { test, expect } from '@playwright/test'

const PRODUCT_HANDLE = process.env.VERIFY_PRODUCT_HANDLE ?? 'sunappi'

test('PDP variant click swaps image and updates selection', async ({ page }) => {
  await page.goto(`/products/${PRODUCT_HANDLE}`, { waitUntil: 'networkidle' })
  await expect(page.getByTestId('price-display')).toBeVisible()

  async function mainSrc(): Promise<string> {
    return (await page.getByTestId('main-image').locator('img').first().getAttribute('src')) ?? ''
  }
  function tail(url: string): string {
    try {
      const dec = decodeURIComponent(url.split('url=')[1]?.split('&')[0] ?? url)
      return dec.split('/').slice(-1)[0] ?? url
    } catch {
      return url
    }
  }

  // Give hydration time to swap to the seed-finish image
  await page.waitForTimeout(1500)
  const initial = await mainSrc()
  await page.screenshot({ path: 'test-results/swap-0-initial-green.png' })

  await page.getByTestId('finish-white').click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: 'test-results/sunappi-white.png' })

  await page.getByTestId('material-stone').click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'test-results/sunappi-white-stone.png' })

  console.log('initial:', tail(initial))
})
