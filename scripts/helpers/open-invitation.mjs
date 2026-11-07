export async function openInvitation(page) {
  await page.getByRole('button', { name: 'Open wedding invitation', exact: true }).click()
  await page.locator('.invitation-envelope').waitFor({ state: 'detached' })
  await page.locator('#main-content').waitFor({ state: 'visible' })
}
