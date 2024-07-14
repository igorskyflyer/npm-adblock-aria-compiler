import { u } from '@igor.dvlpr/upath'
import { accessSync, readFileSync } from 'node:fs'
import type { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import type { IAriaMeta } from '../models/IAriaMeta.mjs'
import type { IAriaVar } from '../models/IAriaVar.mjs'

const patternExpires = /.*\(update frequency\)$/gi

export function parseExternalMeta(
  templatePath: AriaTemplatePath
): IAriaMeta | null {
  const meta: IAriaMeta = {}

  if (typeof templatePath !== 'string') {
    return null
  }

  if (!hasMetaFile(templatePath)) {
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

export function hasMetaFile(templatePath: AriaTemplatePath): boolean {
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

export function amendExpires(expires: string | undefined): string {
  if (typeof expires !== 'string') {
    return ''
  }

  expires = expires.trim()

  if (!patternExpires.test(expires)) {
    expires += ' (update frequency)'
  }

  return expires
}

export function createVars(): IAriaVar {
  return {
    title: '',
    description: '',
    filename: '',
    version: '',
    lastModified: '',
    entries: 0,
    expires: ''
  }
}
