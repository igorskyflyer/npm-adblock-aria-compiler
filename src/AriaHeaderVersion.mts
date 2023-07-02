import { Keppo } from '@igor.dvlpr/keppo'

export type AriaHeaderVersion = 'semver' | 'timestamp' | 'time'

const semVerPattern: RegExp = /Version:[^\d]*((?:\d+\.\d+\.\d+)|(?:\d+)$)/gim

function hasSemVer(header: string): boolean {
  if (typeof header !== 'string') {
    return false
  }

  const match: RegExpMatchArray | null = header.match(semVerPattern)
  return match !== null && match.length === 1
}

function getSemVer(header: string): string {
  if (typeof header !== 'string') {
    return ''
  }

  const data: RegExpExecArray | null = semVerPattern.exec(header)

  if (data) {
    return data.at(1) ?? ''
  }

  return ''
}

function getHeaderVersion(header: string): Keppo | null {
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

console.log(
  getHeaderVersion(`
[Adblock Plus 2.0]
!
!     ___        __   _    __        _      __
!    /   |  ____/ /  | |  / /____   (_)____/ /
!   / /| | / __  /   | | / // __ \ / // __  /
!  / ___ |/ /_/ /    | |/ // /_/ // // /_/ /
! /_/  |_|\__,_/     |___/ \____//_/ \__,_/
!
!
! {@!}
! Title: AdVoid.Core
! Description: ✈ AdVoid is an efficient AdBlock filter that blocks ads, trackers, malwares and a lot more if you want it to! 👾
! Version: 1.8.1017
! Last modified: 2023-07-02T16:19:47+0200
! Expires: 6 hours (update frequency)
! Homepage: https://github.com/igorskyflyer/ad-void
! Entries: 2470
! Author: Igor Dimitrijević (@igorskyflyer)
! GitHub issues: https://github.com/igorskyflyer/ad-void/issues
! GitHub pull requests: https://github.com/igorskyflyer/ad-void/pulls
! License: https://github.com/igorskyflyer/ad-void/blob/main/LICENSE.txt
! Source: World Wide Web
! {/@!}
`)
)

export function constructSemVer(header: string): string {
  let version: Keppo | null = getHeaderVersion(header)

  if (version === null) {
    version = new Keppo(1, 0, 0)
  } else {
    version.increasePatch()
  }

  return version.toString()
}
