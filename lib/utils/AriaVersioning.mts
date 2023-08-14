import { Keppo } from '@igor.dvlpr/keppo'
import { AriaHeaderVersion } from '../models/AriaHeaderVersion.mjs'
import { IAriaVar } from '../models/IAriaVar.mjs'
import { AriaMetaVars } from './AriaMetaVar.mjs'
import { AriaCompileVar } from './AriaCompileVar.mjs'

const semVerPattern: RegExp = /! Version:\s*(\d+\.\d+\.\d+)/gim
const timestampPattern: RegExp = /! Version:\s*(\d+)$/gim
const versionPlaceholderPattern: RegExp = /! Version: \$version$/gim
const versionPattern: RegExp = /! Version:.*$/gim

function hasPattern(header: string, pattern: RegExp): boolean {
  if (typeof header !== 'string') {
    return false
  }

  pattern.lastIndex = 0

  return pattern.test(header)
}

function getData(header: string, pattern: RegExp): string {
  if (typeof header !== 'string') {
    return ''
  }

  pattern.lastIndex = 0

  const data: RegExpExecArray | null = pattern.exec(header)

  if (data) {
    return data.at(1) ?? ''
  }

  return ''
}

function hasSemVer(header: string): boolean {
  return hasPattern(header, semVerPattern)
}

function getSemVer(header: string): string {
  return getData(header, semVerPattern)
}

function hasTimestamp(header: string): boolean {
  return hasPattern(header, timestampPattern)
}

function hasVersionPlaceholder(header: string): boolean {
  return hasPattern(header, versionPlaceholderPattern)
}

function hasVersion(header: string): boolean {
  return hasSemVer(header) || hasTimestamp(header) || hasVersionPlaceholder(header)
}

function getHeaderSemVer(header: string): AriaHeaderVersion {
  if (typeof header !== 'string') {
    return null
  }

  if (hasSemVer(header)) {
    const versionString = getSemVer(header)
    const version = new Keppo(versionString)
    return version
  }

  return null
}

export function getCurrentISOTime(): string {
  const now: Date = new Date()
  const timeZoneOffset: number = now.getTimezoneOffset()
  const isoString: string = now.toISOString()

  const offsetHours: string = Math.floor(Math.abs(timeZoneOffset) / 60)
    .toString()
    .padStart(2, '0')
  const offsetMinutes: string = (Math.abs(timeZoneOffset) % 60).toString().padStart(2, '0')
  const offsetSign: string = timeZoneOffset >= 0 ? '-' : '+'

  const offsetString: string = `${offsetSign}${offsetHours}:${offsetMinutes}`

  return isoString.replace('Z', offsetString)
}

export function constructVersion(header: string, mode: AriaVersioning): string {
  if (mode === 'timestamp') {
    return Date.now().toString()
  }

  const version: AriaHeaderVersion = getHeaderSemVer(header)

  if (version === null) {
    return new Keppo(1, 0, 0).toString()
  } else {
    version.increasePatch()
  }

  return version.toString()
}

export function injectVersionPlaceholder(header: string): string {
  if (!hasVersion(header)) {
    if (header.at(-1) !== '\n') {
      header += '\n'
    }

    header += '! Version: $version'
  }

  return header
}

export function replacePlaceholders(header: string, data: IAriaVar): string {
  if (typeof header !== 'string') {
    return ''
  }

  // meta variables
  for (const [key, placeholder] of Object.entries(AriaMetaVars)) {
    header = header.replace(placeholder.pattern, data[key])
  }

  // compile variables
  for (const [key, placeholder] of Object.entries(AriaCompileVar)) {
    header = header.replace(placeholder.pattern, data[key])
  }

  return header
}

function isAriaVersioning(version: string): version is AriaVersioning {
  return ['auto', 'semver', 'timestamp'].includes(version.toLowerCase())
}

export function transformHeader(header: string, newVersion: string): string
export function transformHeader(header: string, mode: AriaVersioning): string

export function transformHeader(header: string, version: string): string {
  {
    if (typeof header !== 'string') {
      return ''
    }

    let newVersion: string

    if (isAriaVersioning(version)) {
      newVersion = constructVersion(header, version)
    } else {
      newVersion = version
    }

    if (hasVersion(header)) {
      return header.replace(versionPattern, `! Version: ${newVersion}`)
    } else {
      return `${header}\n! Version: ${newVersion}`
    }
  }
}

export type AriaVersioning = 'semver' | 'timestamp' | 'auto'
