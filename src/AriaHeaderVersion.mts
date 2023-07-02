import { Keppo } from '@igor.dvlpr/keppo'

type HeaderVersion = Keppo | string | null

const semVerPattern: RegExp = /Version:\s*(\d+\.\d+\.\d+)/gim
const timestampPattern: RegExp = /Version:\s*(\d+)$/gim
const versionPattern: RegExp = /Version:.*$/gim

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

function getHeaderVersion(header: string): HeaderVersion {
  if (typeof header !== 'string') {
    return null
  }

  if (hasSemVer(header)) {
    const versionString = getSemVer(header)
    const version = new Keppo(versionString)
    return version
  } else if (hasTimestamp(header)) {
    return Date.now().toString()
  }

  return null
}

function constructVersion(header: string): string {
  let version: HeaderVersion = getHeaderVersion(header)

  if (version === null) {
    return new Keppo(1, 0, 0).toString()
  } else if (typeof version === 'string') {
    return Date.now().toString()
  } else {
    version.increasePatch()
    return version.toString()
  }
}

export function transformHeader(header: string): string {
  if (typeof header !== 'string') {
    return ''
  }

  const newVersion: string = constructVersion(header)
  return header.replace(versionPattern, `Version: ${newVersion}`)
}

export type AriaHeaderVersion = 'semver' | 'timestamp'
