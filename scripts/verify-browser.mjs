import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const baseURL = process.env.VERIFY_URL || 'http://localhost:5173'
const report = []
const browserErrors = []
const add = (message) => { report.push(message); console.log(`PASS ${message}`) }
await mkdir(new URL('../.verification/', import.meta.url), { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio'] })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('pageerror', (error) => browserErrors.push(error.message))
page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()) })
page.on('request', (request) => { if (request.method() === 'POST') browserErrors.push(`Unexpected submission: ${request.url()}`) })

try {
  const response = await page.goto(baseURL)
  assert.equal(response?.status(), 200)
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.waitForFunction(() => [...document.images].filter((image) => image.loading !== 'lazy').every((image) => image.complete && image.naturalWidth > 0))
  add('Development server responds with a rendered Vue invitation')

  for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction((expected) => window.innerWidth === expected, width)
    const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
    assert.ok(layout.document <= width && layout.body <= width, `Horizontal overflow at ${width}px: ${JSON.stringify(layout)}`)
    assert.equal(await page.getByRole('navigation').count(), 0)
    add(`No horizontal overflow at ${width}px`)
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: new URL(`../.verification/${width === 390 ? 'mobile' : 'desktop'}.png`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1') })
    }
  }

  await page.setViewportSize({ width: 390, height: 900 })

  const rsvp = page.getByRole('link', { name: 'Sahkan kehadiran', exact: true })
  assert.equal(await rsvp.getAttribute('href'), 'https://docs.google.com/forms/d/e/1FAIpQLSdd8ZgpwYWRtRDrX7WBDE8Ka8WrJxWWmeBkaHgtiiEd91kuSw/viewform?pli=1')
  assert.equal(await rsvp.getAttribute('target'), '_blank')
  assert.equal(await rsvp.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(await page.locator('#rsvp form, #rsvp input, #rsvp select, #rsvp textarea').count(), 0)
  add('RSVP links to the supplied Google Form in a new tab')

  await page.getByRole('button', { name: 'Add a demo wish' }).click()
  assert.equal(await page.locator('#wish-name-error').isVisible(), true)
  assert.equal(await page.locator('#wish-message-error').isVisible(), true)
  await page.locator('#wish-name').fill('Temporary Demo Guest')
  await page.locator('#wish-message').fill('Wishing you love! <script>throw new Error("unsafe")</script>')
  await page.getByRole('button', { name: 'Add a demo wish' }).click()
  assert.match(await page.locator('.wish-card').first().innerText(), /<script>/)
  assert.match(await page.locator('.wish-card').first().innerText(), /This page only/i)
  for (let index = 0; index < 4; index++) {
    await page.locator('#wish-name').fill(`Scrolling Guest ${index + 1}`)
    await page.locator('#wish-message').fill('Wishing you a lifetime of happiness together! '.repeat(index + 1))
    await page.getByRole('button', { name: 'Add a demo wish' }).click()
  }
  await page.waitForFunction(() => {
    const list = document.querySelector('.wishes-list')
    return list && list.scrollHeight > list.clientHeight && list.scrollTop === 0
  })
  const visibleWishes = await page.locator('.wishes-list').evaluate(list => {
    const viewport = list.getBoundingClientRect()
    return [...list.querySelectorAll('.wish-card')].filter(card => {
      const bounds = card.getBoundingClientRect()
      return bounds.top >= viewport.top - 1 && bounds.bottom <= viewport.bottom + 1
    }).length
  })
  assert.equal(visibleWishes, 2)
  await page.locator('.wishes-list').focus()
  await page.keyboard.press('End')
  await page.waitForFunction(() => {
    const list = document.querySelector('.wishes-list')
    return list && Math.abs(list.scrollHeight - list.clientHeight - list.scrollTop) <= 1
  })
  add('Two wish cards fit in the list and older wishes remain reachable by keyboard scrolling')
  await page.reload()
  await page.getByRole('heading', { level: 1 }).waitFor()
  assert.equal(await page.getByText('Temporary Demo Guest', { exact: true }).count(), 0)
  add('Guest wishes validate, render text safely, and disappear after reload')

  assert.equal(await page.locator('audio, .music-control').count(), 0)
  add('Demo music controls and audio are absent')

  const countdownBefore = await page.getByRole('timer').innerText()
  await page.waitForFunction((text) => document.querySelector('[role="timer"]')?.innerText !== text, countdownBefore, { timeout: 3000 })
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto')
  add('Countdown ticks and reduced-motion settings disable smooth scrolling')

  await page.goto(`${baseURL}/a-nonexistent-route`)
  await page.waitForURL(`${baseURL}/`)
  add('Vue Router safely redirects unknown routes to the invitation')

  const pageToken = `document-${Date.now()}`
  await page.evaluate((token) => { window.__verificationToken = token }, pageToken)
  const checkToken = async () => assert.equal(await page.evaluate(() => window.__verificationToken), pageToken, 'HMR unexpectedly reloaded the document')
  const vuePath = new URL('../src/components/wedding/WeddingHero.vue', import.meta.url)
  const tsPath = new URL('../src/config/wedding.ts', import.meta.url)
  const cssPath = new URL('../src/assets/styles/main.css', import.meta.url)
  const vueOriginal = await readFile(vuePath, 'utf8')
  const tsOriginal = await readFile(tsPath, 'utf8')
  const cssOriginal = await readFile(cssPath, 'utf8')
  try {
    assert.ok(vueOriginal.includes('A beautiful beginning.'))
    await writeFile(vuePath, vueOriginal.replace('A beautiful beginning.', 'HMR Vue verification.'))
    await page.getByText('HMR Vue verification.', { exact: false }).waitFor()
    await checkToken()
    add('Saving a Vue template automatically updates Chrome without refreshing')
    await writeFile(vuePath, vueOriginal)
    await page.getByText('A beautiful beginning.', { exact: false }).waitFor()

    assert.match(tsOriginal, /closingMessage: '[^']+'/)
    await writeFile(tsPath, tsOriginal.replace(/closingMessage: '[^']+'/, "closingMessage: 'HMR TypeScript verification.'"))
    await page.getByText('HMR TypeScript verification.', { exact: true }).waitFor()
    await checkToken()
    add('Saving TypeScript wedding data automatically updates Chrome without refreshing')
    await writeFile(tsPath, tsOriginal)
    await page.getByText('HMR TypeScript verification.', { exact: true }).waitFor({ state: 'detached' })

    await writeFile(cssPath, `${cssOriginal}\nbody { --hmr-verification: confirmed; }\n`)
    await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--hmr-verification').trim() === 'confirmed')
    await checkToken()
    add('Saving CSS automatically updates Chrome without refreshing')
  } finally {
    await writeFile(vuePath, vueOriginal)
    await writeFile(tsPath, tsOriginal)
    await writeFile(cssPath, cssOriginal)
  }
  await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--hmr-verification').trim() === '')
  await page.clock.install({ time: new Date('2026-12-11T19:29:58+08:00') })
  await page.reload()
  await page.clock.runFor(3000)
  assert.equal(await page.getByRole('heading', { name: 'Our forever has begun' }).isVisible(), true)
  assert.match(await page.getByRole('timer').innerText(), /00/)
  add('Expired countdown stops at zero and shows the wedding celebration message')

  const launch = JSON.parse(await readFile(new URL('../.vscode/launch.json', import.meta.url), 'utf8'))
  assert.equal(launch.configurations[0].type, 'pwa-chrome')
  assert.equal(launch.configurations[0].url, baseURL)
  const tasks = JSON.parse(await readFile(new URL('../.vscode/tasks.json', import.meta.url), 'utf8'))
  assert.equal(tasks.tasks[0].label, launch.configurations[0].preLaunchTask)
  add('VS Code F5 configuration selects Chrome and the matching Vite background task')
  assert.deepEqual(browserErrors, [], 'Browser errors or unexpected submissions')
  add('No browser exceptions, console errors, or network form submissions')
  await writeFile(new URL('../.verification/report.json', import.meta.url), JSON.stringify({ browser: await browser.version(), baseURL, passed: report, browserErrors }, null, 2))
  console.log(`\nAll ${report.length} browser checks passed in Google Chrome.`)
} finally {
  await browser.close()
}
