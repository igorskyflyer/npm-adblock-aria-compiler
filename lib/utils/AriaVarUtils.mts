import { u } from '@igor.dvlpr/upath'
import { accessSync, readFileSync } from 'node:fs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaVar } from '../models/IAriaVar.mjs'

export function parseMeta(templatePath: AriaTemplatePath): IAriaMeta | null {
  const meta: IAriaMeta = {}

  if (typeof templatePath !== 'string') {
    return null
  }

  if (!hasMeta(templatePath)) {
    return null
  }

  try {
    const metaPath: string | null = getMetaPath(templatePath)

    if (typeof metaPath === 'string') {
      const contents: string = readFileSync(u(metaPath), { encoding: 'utf-8' })
      const json: any = JSON.parse(contents)

      // we copy only the props we need
      // and discard everything else
      meta.title = json.title ?? ''
      meta.description = json.description ?? ''
      meta.versioning = json.versioning ?? 'auto'
      meta.expires = json.expires ?? ''
    } else {
      return null
    }
  } catch {
    return null
  }

  return meta
}

export function getMetaPath(templatePath: AriaTemplatePath): string | null {
  if (typeof templatePath !== 'string') {
    return null
  }

  return templatePath.replace(/(.*)\..*$/i, '$1.adbm')
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
    accessSync(u(filePath))
  } catch {
    return false
  }

  return true
}

export function createVars(): IAriaVar {
  return {
    title: '',
    description: '',
    filename: '',
    version: '',
    lastModified: '',
    entries: 0,
    expires: '',
  }
}
