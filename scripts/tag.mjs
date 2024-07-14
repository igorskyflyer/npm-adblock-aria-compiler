import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { exit } from 'node:process'

try {
  const packageFile = readFileSync('./package.json', { encoding: 'utf-8' })
  const packageInfo = JSON.parse(packageFile)
  const commit = execSync('git rev-parse --short=7 HEAD').toString().trim()

  writeFileSync(
    './dist/lib/version.mjs',
    `export const version = { cli: '${packageInfo.version}', adbt: '${packageInfo.uses.adbt}', commit: '${commit}' }\r\n`
  )
  console.log('✅ Successfully tagged the release.')
  exit(0)
} catch {
  console.error("❌ Couldn't tag the release.")
  exit(1)
}
