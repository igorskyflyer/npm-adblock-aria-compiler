export type AriaHeaderVersion = 'semver' | 'timestamp'

const semVerPattern: RegExp = /Version:[^\d]*([\d\.]+)/gi

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

export function parseSemVer() {}
