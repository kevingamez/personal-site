import { expect, test, type Page } from '@playwright/test'

// The console's built-in commands answer in the page language. /es/ used to
// print every built-in in English. Reduced motion skips the intro curtain and
// makes the self-typing demo run its commands instantly, which doubles as the
// signal that the lazily loaded console script is wired up.
test.use({ reducedMotion: 'reduce' })

async function openConsole(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.locator('#console').scrollIntoViewIfNeeded()
  // The demo's first echoed command only appears once initConsole() has run;
  // before that, Enter would natively submit the form and reload the page.
  await expect(page.locator('#console-stream .cs-cmd').first()).toBeVisible({ timeout: 15_000 })
}

async function run(page: Page, command: string): Promise<void> {
  const input = page.locator('#console-msg')
  await input.fill(command)
  await input.press('Enter')
}

test('/es/ console answers built-ins in Spanish', async ({ page }) => {
  await openConsole(page, '/es/')
  const stream = page.locator('#console-stream')

  // The demo's own whoami.
  await expect(stream).toContainText('hasta hace poco')

  await run(page, 'help')
  await expect(stream).toContainText('muestra el directorio actual')
  await expect(stream).not.toContainText('print working directory')

  await run(page, 'nope')
  await expect(stream.locator('.cs-err').last()).toHaveText(
    'zsh: comando no encontrado: nope, prueba help'
  )

  await run(page, 'cat nada')
  await expect(stream.locator('.cs-err').last()).toHaveText('cat: nada: no existe ese archivo')

  // Built-in output is announced once through the polite status node.
  await run(page, 'whoami')
  await expect(page.locator('#console-status')).toContainText('hasta hace poco')

  await expect(page.locator('#console-msg')).toHaveAttribute('aria-label', 'Comando de la consola')
  await expect(page.locator('#console-suggest')).toHaveAttribute('aria-label', 'Comandos rápidos')
})

test('/ console still answers built-ins in English', async ({ page }) => {
  await openConsole(page, '/')
  const stream = page.locator('#console-stream')

  await run(page, 'help')
  await expect(stream).toContainText('print working directory')

  await run(page, 'nope')
  await expect(stream.locator('.cs-err').last()).toHaveText(
    'zsh: command not found: nope, try help'
  )
  await expect(page.locator('#console-status')).toContainText('command not found')
  await expect(page.locator('#console-msg')).toHaveAttribute('aria-label', 'Console command')
})
