import { Keppo } from '@igor.dvlpr/keppo'

type HeaderVersion = Keppo | null

const semVerPattern: RegExp = /! Version:\s*(\d+\.\d+\.\d+)/gim
const timestampPattern: RegExp = /! Version:\s*(\d+)$/gim
const versionPlaceholderPattern: RegExp = /! Version: \$v$/gim
const versionPattern: RegExp = /! Version:.*$/gim

function hasPattern(header: string, pattern: RegExp): boolean {
  if (typeof header !== 'string') {
    return false
  }

  const match: RegExpMatchArray | null = header.match(pattern)
  return match !== null && match.length === 1
}

function getData(header: string, pattern: RegExp): string {
  if (typeof header !== 'string') {
    return ''
  }

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

export function hasVersion(header: string): boolean {
  return hasSemVer(header) || hasTimestamp(header) || hasVersionPlaceholder(header)
}

function getHeaderSemVer(header: string): HeaderVersion {
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

export function constructVersion(header: string, mode: AriaHeaderVersion): string {
  if (mode === 'timestamp') {
    return Date.now().toString()
  }

  const version: HeaderVersion = getHeaderSemVer(header)

  if (version === null) {
    return new Keppo(1, 0, 0).toString()
  } else {
    version.increasePatch()
  }

  return version.toString()
}

export function injectVersionPlaceholder(header: string): string {
  if (!hasVersion(header)) {
    if (header.at(0) !== '\n') {
      header = `\n${header}`
    }

    if (header.at(-1) !== '\n') {
      header += '\n'
    }

    header += '! Version: $v'
  }

  return header
}

export function replaceVersionPlaceholder(header: string, version: string): string {
  if (typeof header !== 'string') {
    return ''
  }

  return header.replace(versionPlaceholderPattern, `! Version: ${version}`)
}

export function transformHeader(header: string, mode: AriaHeaderVersion): string {
  if (typeof header !== 'string') {
    return ''
  }

  const newVersion: string = constructVersion(header, mode)

  if (hasVersion(header)) {
    return header.replace(versionPattern, `! Version: ${newVersion}`)
  } else {
    return `${header}\n! Version: ${newVersion}`
  }
}

export type AriaHeaderVersion = 'semver' | 'timestamp'
