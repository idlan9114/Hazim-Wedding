import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright-core'
import { openInvitation } from './helpers/open-invitation.mjs'

const origin = 'http://localhost:5195'
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--configLoader', 'runner', '--port', '5195', '--strictPort'], {
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
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 1000 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' || message.type() === 'warning') errors.push(message.text()) })
  await page.goto(origin)
  await openInvitation(page)
  await page.getByRole('heading', { level: 1 }).waitFor()
  assert.equal(await page.locator('h1').evaluate(node => getComputedStyle(node).animationName), 'none')
  assert.equal(await page.locator('.hero-date-seal').evaluate(node => getComputedStyle(node).animationName), 'none')
  await page.waitForFunction(() => ['.hero-art', '.hero-date-seal', 'h1'].every(selector => document.querySelector(selector).getAnimations().every(animation => animation.playState === 'finished')))
  assert.equal(await page.locator('.hero-art').evaluate(node => getComputedStyle(node).opacity), '1')
  await page.screenshot({ path: '.verification/motion-hero-390.png' })
  assert.equal(await page.locator('footer').evaluate(node => node.classList.contains('reveal-pending')), true)
  console.log('PASS The hero and date badge are immediately visible as the envelope opens')

  const events = page.locator('#celebration')
  const firstCard = events.locator('.event-card').first()
  const lastCard = events.locator('.event-card').last()
  await firstCard.scrollIntoViewIfNeeded()
  await page.waitForFunction(() => document.querySelector('#celebration').classList.contains('is-revealed'))
  await page.waitForFunction(() => document.querySelector('#celebration .event-card').classList.contains('is-revealed'))
  await page.waitForFunction(() => document.querySelector('#celebration').getAnimations({ subtree: true }).every(animation => animation.playState === 'finished'))
  assert.equal(await lastCard.evaluate(node => node.classList.contains('reveal-pending')), true, 'Cards below the viewport should wait until guests reach them')
  assert.equal(await firstCard.evaluate(node => getComputedStyle(node).transitionDuration), '1.4s, 1.4s')
  await firstCard.evaluate(node => {
    node.dataset.replays = '0'
    node.addEventListener('transitionrun', () => { node.dataset.replays = String(Number(node.dataset.replays) + 1) })
  })
  await page.locator('#home').scrollIntoViewIfNeeded()
  await firstCard.scrollIntoViewIfNeeded()
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await firstCard.getAttribute('data-replays'), '0')
  for (const card of await events.locator('.event-card').all()) {
    await card.scrollIntoViewIfNeeded()
    await card.evaluate(node => new Promise(resolve => {
      if (node.classList.contains('is-revealed')) { resolve(); return }
      const observer = new MutationObserver(() => {
        if (node.classList.contains('is-revealed')) { observer.disconnect(); resolve() }
      })
      observer.observe(node, { attributes: true, attributeFilter: ['class'] })
    }))
  }
  await page.waitForFunction(() => document.querySelector('#celebration').getAnimations({ subtree: true }).every(animation => animation.playState === 'finished'))
  assert.equal(await lastCard.evaluate(node => getComputedStyle(node).opacity), '1')
  await events.screenshot({ path: '.verification/motion-schedule-390.png' })
  console.log('PASS Slower 1.4-second card reveals wait for each card to enter view and run once')

  await page.locator('#rsvp a').focus()
  assert.equal(await page.locator('#rsvp').evaluate(node => getComputedStyle(node).opacity), '1')
  assert.equal(await page.getByRole('link', { name: 'Sahkan kehadiran', exact: true }).getAttribute('target'), '_blank')
  console.log('PASS Keyboard focus reveals content immediately and RSVP remains accessible')

  for (let index = 0; index < 3; index++) {
    await page.locator('#wish-name').fill('Animation Guest ' + index)
    await page.locator('#wish-message').fill('Semoga berbahagia hingga ke syurga. '.repeat(index + 1))
    await page.getByRole('button', { name: 'Add a demo wish', exact: true }).click()
  }
  await page.waitForFunction(() => {
    const list = document.querySelector('.wishes-list')
    const cards = list.querySelectorAll('.wish-card')
    return Math.abs(list.clientHeight - (cards[1].getBoundingClientRect().bottom - cards[0].getBoundingClientRect().top)) <= 1
  })
  await page.locator('.wishes-list').focus()
  await page.keyboard.press('End')
  await page.waitForFunction(() => document.querySelector('.wishes-list').scrollTop > 0)
  console.log('PASS New-card fades preserve form submission and the independent two-card scrolling area')

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Overflow at ' + width)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => document.querySelectorAll('.reveal-pending').length === 0)
  assert.equal(await page.locator('h1').evaluate(node => getComputedStyle(node).animationName), 'none')
  assert.equal(await page.locator('footer').evaluate(node => getComputedStyle(node).opacity), '1')
  console.log('PASS Changing reduced-motion preference makes pending content visible and disables animations')

  const reduced = await browser.newContext({ reducedMotion: 'reduce' })
  const reducedPage = await reduced.newPage()
  await reducedPage.goto(origin)
  await openInvitation(reducedPage)
  await reducedPage.getByRole('heading', { level: 1 }).waitFor()
  assert.equal(await reducedPage.locator('.reveal-pending').count(), 0)
  assert.equal(await reducedPage.locator('.hero-art').evaluate(node => getComputedStyle(node).animationName), 'none')
  const fallbackPage = await context.newPage()
  await fallbackPage.addInitScript(() => { delete window.IntersectionObserver })
  await fallbackPage.goto(origin)
  await openInvitation(fallbackPage)
  await fallbackPage.getByRole('heading', { level: 1 }).waitFor()
  assert.equal(await fallbackPage.locator('.reveal-pending').count(), 0)
  console.log('PASS Reduced-motion and missing-observer fallbacks keep every section readable')

  await page.emulateMedia({ reducedMotion: 'no-preference', media: 'print' })
  assert.equal(await page.locator('footer').evaluate(node => getComputedStyle(node).opacity), '1')
  assert.equal(await page.locator('h1').evaluate(node => getComputedStyle(node).animationName), 'none')
  assert.deepEqual(errors, [])
  console.log('PASS Printing, responsive layouts, and browser diagnostics remain clear')
} finally {
  await browser?.close()
  server.kill()
}
