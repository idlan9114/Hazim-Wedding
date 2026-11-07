// Exercises the real Supabase SDK against local HTTP/WebSocket fixtures.
// It does not access or modify a real Supabase project.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { chromium } from 'playwright-core'

const origin = 'http://localhost:5193'
const supabaseOrigin = 'https://guestbook-verification.supabase.co'
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--configLoader', 'runner', '--port', '5193', '--strictPort'], {
  cwd: new URL('../', import.meta.url),
  windowsHide: true,
  env: { ...process.env, VITE_SUPABASE_URL: supabaseOrigin, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_verification_only' },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverLog = ''
server.stdout.on('data', chunk => { serverLog += chunk })
server.stderr.on('data', chunk => { serverLog += chunk })
let browser

try {
  let ready = false
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(serverLog)
    try {
      if ((await fetch(origin)).ok) { ready = true; break }
    } catch { /* Server is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  assert.ok(ready, `Test server did not start: ${serverLog}`)
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' })
  const errors = []
  context.on('page', page => page.on('pageerror', error => errors.push(error.message)))
  let tick = 0
  const rows = Array.from({ length: 3 }, (_, index) => ({
    id: randomUUID(), name: `Saved Guest ${index + 1}`, message: 'Wishing you a beautiful marriage and a lifetime of happiness.',
    created_at: new Date(Date.UTC(2026, 10, 7, 10, 0, tick++)).toISOString(),
  }))
  let failRead = true
  let failWrite = true
  let readCount = 0
  let writeCount = 0
  let holdNextRead = false
  let releaseRead
  const sockets = new Set()
  const connections = new Set()

  async function waitUntil(condition, label) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (condition()) return
      await new Promise(resolve => setTimeout(resolve, 30))
    }
    assert.fail(label)
  }

  function broadcast(type, row) {
    for (const socket of sockets) {
      socket.ws.send(JSON.stringify([socket.joinRef, null, socket.topic, 'postgres_changes', {
        ids: ['1'], data: { schema: 'public', table: 'guest_wishes', commit_timestamp: new Date().toISOString(), type, errors: null, columns: [], record: row, old_record: { id: row.id } },
      }]))
    }
  }

  await context.routeWebSocket('wss://guestbook-verification.supabase.co/**', ws => {
    connections.add(ws)
    let socket
    ws.onMessage(message => {
      const [joinRef, ref, topic, event, payload] = JSON.parse(message.toString())
      if (event === 'phx_join') {
        socket = { ws, joinRef, topic }
        sockets.add(socket)
        const filters = payload.config.postgres_changes.map(filter => ({ ...filter, id: '1' }))
        ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response: { postgres_changes: filters } }]))
      } else if (event === 'heartbeat' || event === 'phx_leave') {
        ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'ok', response: {} }]))
        if (event === 'phx_leave' && socket) sockets.delete(socket)
      }
    })
    ws.onClose(() => {
      connections.delete(ws)
      if (socket) sockets.delete(socket)
    })
  })

  await context.route(`${supabaseOrigin}/**`, async route => {
    const request = route.request()
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'content-type': 'application/json',
    }
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    assert.equal(new URL(request.url()).pathname, '/rest/v1/guest_wishes')
    if (request.method() === 'GET') {
      readCount++
      if (failRead) return route.fulfill({ status: 400, headers, body: JSON.stringify({ code: 'PGRST205', message: 'Table not found' }) })
      const snapshot = JSON.stringify([...rows].sort((a, b) => b.created_at.localeCompare(a.created_at)))
      if (holdNextRead) {
        holdNextRead = false
        await new Promise(resolveRead => { releaseRead = resolveRead })
      }
      return route.fulfill({ status: 200, headers, body: snapshot })
    }
    assert.equal(request.method(), 'POST')
    writeCount++
    await new Promise(resolve => setTimeout(resolve, 100))
    if (failWrite) return route.fulfill({ status: 403, headers, body: JSON.stringify({ code: '42501', message: 'Permission denied' }) })
    const input = request.postDataJSON()
    assert.deepEqual(Object.keys(input).sort(), ['message', 'name'])
    const row = { id: randomUUID(), ...input, created_at: new Date(Date.UTC(2026, 10, 7, 10, 0, tick++)).toISOString() }
    rows.push(row)
    await route.fulfill({ status: 201, headers, body: JSON.stringify(row) })
    broadcast('INSERT', row)
  })

  const first = await context.newPage()
  await first.goto(origin)
  await first.getByRole('heading', { level: 1 }).waitFor()
  assert.equal(readCount, 0)
  assert.equal(sockets.size, 0)
  assert.equal(connections.size, 0)
  assert.equal(await first.evaluate(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('@supabase_supabase-js'))), false)
  console.log('PASS Opening the invitation does not download the database SDK, read wishes, or open live connections')
  await first.locator('#wishes').scrollIntoViewIfNeeded()
  await first.getByText('Wishes could not be loaded. Please try again.', { exact: true }).waitFor()
  assert.equal(readCount, 1)
  assert.equal(await first.locator('.wish-card').count(), 0)
  failRead = false
  await first.getByRole('button', { name: 'Refresh wishes', exact: true }).click()
  await first.getByText('Saved Guest 1', { exact: true }).waitFor()
  await first.getByRole('button', { name: 'Send wish', exact: true }).click()
  assert.equal(await first.locator('#wish-name-error').isVisible(), true)
  assert.equal(await first.locator('#wish-message-error').isVisible(), true)

  await first.locator('#wish-name').fill('Persistent Guest')
  await first.locator('#wish-message').fill('May your days be happy! <script>throw new Error("unsafe")</script>')
  await first.getByRole('button', { name: 'Send wish', exact: true }).click()
  await first.getByRole('alert').waitFor()
  assert.equal(await first.locator('#wish-name').inputValue(), 'Persistent Guest')
  assert.match(await first.locator('#wish-message').inputValue(), /<script>/)
  assert.equal(rows.length, 3)
  console.log('PASS Loading errors recover; failed submissions retain text and do not report success')

  const second = await context.newPage()
  await second.goto(origin)
  await second.locator('#wishes').scrollIntoViewIfNeeded()
  await second.getByText('Saved Guest 1', { exact: true }).waitFor()
  await waitUntil(() => sockets.size === 2, 'Both guest books should have live connections')
  assert.equal(readCount, 3, 'One initial read per activation, plus the explicit retry')
  const readsBeforeSave = readCount
  failWrite = false
  await first.getByRole('button', { name: 'Send wish', exact: true }).click()
  await first.getByText('Thank you! Your wish has been saved and shared with the couple.', { exact: true }).waitFor()
  await second.getByText('Persistent Guest', { exact: true }).waitFor()
  assert.equal(readCount, readsBeforeSave, 'Saving and receiving a new wish must not re-download the list')
  assert.equal(await first.locator('#wish-name').inputValue(), '')
  assert.equal(await first.locator('.wish-card').filter({ hasText: 'Persistent Guest' }).count(), 1)
  assert.match(await first.locator('.wish-card').first().innerText(), /<script>/)
  await first.reload()
  await first.locator('#wishes').scrollIntoViewIfNeeded()
  await first.getByText('Persistent Guest', { exact: true }).waitFor()
  console.log('PASS Saved wishes survive reload and appear live in a second tab without duplicates')

  const beforeDelete = readCount
  const removed = rows.shift()
  broadcast('DELETE', removed)
  await first.waitForFunction(name => ![...document.querySelectorAll('.wish-card')].some(card => card.textContent.includes(name)), removed.name)
  assert.equal(readCount, beforeDelete, 'A live deletion must not re-download the list')
  console.log('PASS Removing a wish updates connected visitors')

  const edited = rows.find(row => row.name === 'Saved Guest 2')
  edited.message = 'Updated blessing from the host.'
  const beforeEdit = readCount
  broadcast('UPDATE', edited)
  await first.getByText('“Updated blessing from the host.”', { exact: true }).waitFor()
  await second.getByText('“Updated blessing from the host.”', { exact: true }).waitFor()
  assert.equal(readCount, beforeEdit, 'A live edit must not re-download the list')
  console.log('PASS Insert, update, and delete events apply locally with zero additional list requests')

  await waitUntil(() => sockets.size === 2, 'Both tabs should be connected before backgrounding one')
  const beforePause = readCount
  await second.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await waitUntil(() => sockets.size === 1, 'A background tab should release its live connection')
  await waitUntil(() => connections.size === 1, 'Backgrounding must close the actual WebSocket, not just leave the channel')
  const missed = { id: randomUUID(), name: 'Guest While Away', message: 'A blessing sent while this tab was in the background.', created_at: new Date(Date.UTC(2026, 10, 7, 10, 0, tick++)).toISOString() }
  rows.push(missed)
  broadcast('INSERT', missed)
  await first.getByText(missed.name, { exact: true }).waitFor()
  assert.equal(readCount, beforePause)
  await second.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await second.getByText(missed.name, { exact: true }).waitFor()
  assert.equal(readCount, beforePause + 1, 'Returning to the guest book should reconcile missed changes once')
  console.log('PASS Background tabs release connections and reconcile missed wishes on return')

  await second.locator('#home').scrollIntoViewIfNeeded()
  await waitUntil(() => sockets.size === 1, 'Scrolling away from the guest book should release its connection')
  await waitUntil(() => connections.size === 1, 'Scrolling away must close the actual WebSocket')
  await second.locator('#wishes').scrollIntoViewIfNeeded()
  await waitUntil(() => sockets.size === 2, 'Scrolling back should restore the live connection')
  console.log('PASS Live connections are used only while the guest book is near the viewport')

  await second.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await waitUntil(() => sockets.size === 1, 'Pause before checking changes during a snapshot')
  holdNextRead = true
  await second.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await waitUntil(() => Boolean(releaseRead), 'A snapshot should be waiting for its response')
  const concurrent = { id: randomUUID(), name: 'Guest During Download', message: 'A wish delivered while the previous list was still downloading.', created_at: new Date(Date.UTC(2026, 10, 7, 10, 0, tick++)).toISOString() }
  rows.push(concurrent)
  broadcast('INSERT', concurrent)
  await second.getByText(concurrent.name, { exact: true }).waitFor()
  const finishedRead = second.waitForResponse(response => response.request().method() === 'GET' && new URL(response.url()).pathname === '/rest/v1/guest_wishes')
  releaseRead()
  await (await finishedRead).finished()
  await second.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await second.getByText(concurrent.name, { exact: true }).count(), 1)
  console.log('PASS A new message received during a list download survives the older snapshot')

  for (const width of [320, 390, 1440]) {
    await first.setViewportSize({ width, height: 1000 })
    await first.locator('.wishes-list').evaluate(list => { list.scrollTop = 0 })
    await first.waitForFunction(() => {
      const list = document.querySelector('.wishes-list')
      const cards = list.querySelectorAll('.wish-card')
      return Math.abs(list.clientHeight - (cards[1].getBoundingClientRect().bottom - cards[0].getBoundingClientRect().top)) <= 1
    })
    assert.ok(await first.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (width === 390 || width === 1440) await first.locator('#wishes').screenshot({ path: '.verification/optimized-wishes-' + width + '.png' })
  }
  assert.deepEqual(errors, [])
  assert.equal(writeCount, 2, 'Only the intentional failed save and successful retry should submit data')
  console.log('PASS Two-card scrolling and responsive layout remain intact; no script execution or browser exceptions')

  const blocked = await context.newPage()
  await blocked.routeWebSocket('wss://guestbook-verification.supabase.co/**', ws => {
    ws.onMessage(message => {
      const [joinRef, ref, topic, event] = JSON.parse(message.toString())
      if (event === 'phx_join') ws.send(JSON.stringify([joinRef, ref, topic, 'phx_reply', { status: 'error', response: { reason: 'too_many_connections' } }]))
    })
  })
  await blocked.goto(origin)
  const beforeBlockedRead = readCount
  await blocked.locator('#wishes').scrollIntoViewIfNeeded()
  await blocked.getByText('Live updates are temporarily unavailable. Refresh the wishes to see the latest messages.', { exact: true }).waitFor()
  await blocked.getByText('Saved Guest 2', { exact: true }).waitFor()
  await blocked.waitForTimeout(1500)
  assert.equal(readCount, beforeBlockedRead + 1, 'Rejected live connections should fall back to one ordinary read without repeated list downloads')
  assert.equal(await blocked.getByRole('button', { name: 'Send wish', exact: true }).isVisible(), true)
  console.log('PASS Realtime-capacity errors preserve ordinary wish reads and the submission form without repeated downloads')
  console.log('Supabase fixture checks passed. A live project still needs its settings and SQL setup.')
} finally {
  await browser?.close()
  server.kill()
}
