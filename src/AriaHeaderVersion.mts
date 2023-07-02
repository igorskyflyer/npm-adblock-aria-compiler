import { Keppo } from '@igor.dvlpr/keppo'

type HeaderVersion = Keppo | null

const semVerPattern: RegExp = /! Version:\s*(\d+\.\d+\.\d+)/gim
const timestampPattern: RegExp = /! Version:\s*(\d+)$/gim
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

function hasVersion(header: string): boolean {
  return hasSemVer(header) || hasTimestamp(header)
}

function getHeaderVersion(header: string): HeaderVersion {
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

function constructVersion(header: string, mode: AriaHeaderVersion): string {
  const version: HeaderVersion = getHeaderVersion(header)

  if (mode === 'timestamp') {
    return Date.now().toString()
  }

  if (version === null) {
    return new Keppo(1, 0, 0).toString()
  } else {
    version.increasePatch()
  }

  return version.toString()
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
