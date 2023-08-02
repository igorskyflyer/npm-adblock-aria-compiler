import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { exit } from 'process'

try {
  const packageFile = readFileSync('./package.json', { encoding: 'utf-8' })
  const packageInfo = JSON.parse(packageFile)
  const commit = execSync('git rev-parse --short=7 HEAD').toString().trim()

  writeFileSync('./lib/version', JSON.stringify({ cli: packageInfo.version, adbt: packageInfo.uses.adbt, commit }))
  console.log('✅ Successfully tagged the release.')
  exit(0)
} catch {
  console.error("❌ Couldn't tag the release")
  exit(1)
}