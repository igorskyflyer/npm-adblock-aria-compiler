import { accessSync, readFileSync } from 'node:fs'
import { AriaMeta } from '../models/IAriaMeta.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'

export function parseMeta(templatePath: AriaTemplatePath): AriaMeta | null {
  const meta: AriaMeta = {}

  if (typeof templatePath !== 'string') {
    return null
  }

  if (!hasMeta(templatePath)) {
    return null
  }

  try {
    const metaPath: string | null = getMetaPath(templatePath)
    const contents: string = readFileSync(metaPath!).toString()
    const json: any = JSON.parse(contents)

    // we copy only the props we need
    // and disccard everything else
    meta.title = json.title ?? ''
    meta.description = json.description ?? ''
    meta.versioning = json.versioning ?? 'auto'
  } catch {
    return null
  }

  return meta
}

export function getMetaPath(templatePath: AriaTemplatePath): string | null {
  if (typeof templatePath !== 'string') {
    return null
  }

  return templatePath.replace(/(.*)\..*$/i, '$1.meta.json')
}

export function hasMeta(templatePath: AriaTemplatePath): boolean {
  if (typeof templatePath !== 'string') {
    return false
  }

  const metaFile: string | null = getMetaPath(templatePath)

  if (metaFile != null) {
    return fileExists(metaFile)
  }

  return false
}

function fileExists(filePath: string): boolean {
  try {
    accessSync(filePath)
  } catch {
    return false
  }

  return true
}
