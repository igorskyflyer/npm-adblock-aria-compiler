import { accessSync, readFileSync } from 'node:fs'
import { AriaMeta } from './AriaMeta.mjs'

export function parseMeta(filterPath: string): AriaMeta | null {
  const meta: AriaMeta = {}

  if (typeof filterPath !== 'string' || !fileExists(filterPath)) {
    return null
  }

  try {
    const contents: string = readFileSync(filterPath).toString()
    const json: any = JSON.parse(contents)

    // we copy only the props we need
    // and disccard everything else
    meta.title = json.title ?? ''
    meta.description = json.description ?? ''
    meta.versioning = json.versioning ?? 'auto'
  } catch {}

  return meta
}

function fileExists(filePath: string): boolean {
  try {
    accessSync(filePath)
  } catch {
    return false
  }

  return true
}
