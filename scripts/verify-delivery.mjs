// Checks the built invitation and browser cache locally; does not deploy anything.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright-core'
import { openInvitation } from './helpers/open-invitation.mjs'

const directory = resolve('dist')
const html = await readFile(resolve(directory, 'index.html'), 'utf8')
const entryPath = /<script[^>]+src="([^"]+\.js)"/.exec(html)?.[1]
assert.ok(entryPath, 'Build the site before running this check')
const config = await readFile('netlify.toml', 'utf8')
assert.match(config, /for = "\/assets\/\*"\s+\[headers.values\]\s+Cache-Control = "public, max-age=31536000, immutable"/)
const hits = new Map()
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  hits.set(pathname, (hits.get(pathname) ?? 0) + 1)
  let file = resolve(directory, pathname.replace(/^\/+/, '') || 'index.html')
  if (!file.startsWith(directory + sep)) { response.writeHead(403).end(); return }
  try {
    let body
    try { body = await readFile(file) } catch { file = resolve(directory, 'index.html'); body = Buffer.from(html) }
    const extension = extname(file)
    const headers = {
      'Content-Type': types[extension] ?? 'application/octet-stream',
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
    }
    if (['.html', '.js', '.css', '.svg'].includes(extension) && request.headers['accept-encoding']?.includes('gzip')) {
      body = gzipSync(body)
      headers['Content-Encoding'] = 'gzip'
      headers.Vary = 'Accept-Encoding'
    }
    response.writeHead(200, headers).end(body)
  } catch { response.writeHead(500).end() }
})
await new Promise(resolveReady => server.listen(5194, 'localhost', resolveReady))
let browser
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const exceptions = []
  let databaseRequests = 0
  page.on('pageerror', error => exceptions.push(error.message))
  page.on('request', request => { if (new URL(request.url()).hostname.endsWith('.supabase.co')) databaseRequests++ })
  await page.goto('http://localhost:5194/?visit=first')
  await openInvitation(page)
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.locator('.hero-image-frame img').evaluate(image => image.decode())
  const firstAssets = new Map([...hits].filter(([path]) => path.startsWith('/assets/')))
  assert.equal([...firstAssets.keys()].filter(path => path.endsWith('.js')).length, 1, 'The guest book SDK should not download on opening the invitation')
  assert.equal(databaseRequests, 0)
  await page.goto('http://localhost:5194/?visit=returning')
  await openInvitation(page)
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.locator('.hero-image-frame img').evaluate(image => image.decode())
  for (const [path, count] of firstAssets) assert.equal(hits.get(path), count, 'Returning visitors should reuse the cached asset: ' + path)
  assert.equal(databaseRequests, 0)
  assert.deepEqual(exceptions, [])
  const entry = await readFile(resolve(directory, entryPath.slice(1)))
  const report = {
    initialJavaScriptBytes: entry.length,
    initialJavaScriptGzipBytes: gzipSync(entry).length,
    firstVisitAssetRequests: [...firstAssets.keys()],
    returningVisitAdditionalAssetRequests: 0,
    databaseRequestsBeforeGuestBook: databaseRequests,
    note: 'Local production build with the browser cache policy from netlify.toml; actual Netlify delivery has not been deployed or load tested.',
  }
  await writeFile('.verification/optimized-delivery.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  console.log('PASS Production invitation loads; the SDK stays deferred; repeat visits reuse cached assets with no additional asset requests')
} finally {
  await browser?.close()
  server.closeAllConnections()
  await new Promise(resolveClosed => server.close(resolveClosed))
}
