import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'
import { openInvitation } from './helpers/open-invitation.mjs'

const origin = 'http://localhost:5196'
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--configLoader', 'runner', '--port', '5196', '--strictPort'], {
  cwd: new URL('../', import.meta.url), windowsHide: true,
  env: { ...process.env, VITE_SUPABASE_URL: '', VITE_SUPABASE_PUBLISHABLE_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let log = ''
server.stdout.on('data', chunk => { log += chunk })
server.stderr.on('data', chunk => { log += chunk })
let browser

try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(log)
    try { if ((await fetch(origin)).ok) { ready = true; break } } catch { /* Starting. */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(ready, log)
  await mkdir('.verification', { recursive: true })
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ reducedMotion: 'no-preference' })
  const errors = []
  let databaseRequests = 0
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (new URL(request.url()).hostname.endsWith('.supabase.co')) databaseRequests++ })
  await page.goto(origin)
  const envelope = page.getByRole('button', { name: 'Open wedding invitation', exact: true })
  await envelope.waitFor()
  assert.equal(await page.locator('#main-content, footer').count(), 0)

  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900], [844, 390]]) {
    await page.setViewportSize({ width, height })
    const bounds = await envelope.boundingBox()
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width && bounds.y >= 0 && bounds.y + bounds.height <= height, `Envelope should fit at ${width}x${height}`)
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (width === 390 || width === 1440) await page.screenshot({ path: `.verification/envelope-${width}.png` })
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await envelope.hover()
  await page.mouse.wheel(0, 500)
  assert.equal(await page.evaluate(() => window.scrollY), 0)
  console.log('PASS Envelope fits mobile, tablet, desktop and landscape; the invitation stays closed until opened')

  await envelope.click()
  assert.equal(await envelope.getAttribute('aria-busy'), 'true')
  assert.equal(await envelope.isDisabled(), true)
  await page.locator('#main-content').waitFor({ state: 'visible' })
  assert.equal(await page.locator('.invitation-content').getAttribute('inert'), '')
  assert.equal(await page.locator('.hero-art').evaluate(node => getComputedStyle(node).animationName), 'none')
  await page.waitForTimeout(350)
  await page.screenshot({ path: '.verification/envelope-opening.png' })
  await page.locator('.invitation-envelope').waitFor({ state: 'detached' })
  assert.equal(await page.locator('.invitation-envelope').count(), 0)
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content')
  assert.equal(await page.evaluate(() => window.scrollY), 0)
  await page.mouse.wheel(0, 500)
  await page.waitForFunction(() => window.scrollY > 0)
  assert.equal(await page.locator('#rsvp a').getAttribute('target'), '_blank')
  console.log('PASS Opening panels reveal the website directly underneath, then restore focus and normal page scrolling')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const key of ['Enter', 'Space']) {
    await page.reload()
    await envelope.waitFor()
    await page.keyboard.press('Tab')
    assert.equal(await envelope.evaluate(button => button === document.activeElement), true)
    await page.keyboard.press(key)
    await page.locator('#main-content').waitFor({ state: 'visible', timeout: 1000 })
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main-content')
  }
  console.log('PASS Reload restores the envelope; Enter and Space open immediately with reduced motion and move focus into the page')

  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' })
  const touchPage = await touch.newPage()
  await touchPage.goto(origin)
  await touchPage.getByRole('button', { name: 'Open wedding invitation', exact: true }).tap()
  await touchPage.locator('#main-content').waitFor({ state: 'visible' })
  await touch.close()
  await page.reload()
  await openInvitation(page)
  assert.equal(databaseRequests, 0)
  assert.deepEqual(errors, [])
  console.log('PASS Touch opens the envelope; no browser errors or database requests')
} finally {
  await browser?.close()
  server.kill()
}
