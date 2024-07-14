import type { IAriaPlaceholder } from '../models/IAriaPlaceholder.mjs'

function generatePattern(alias: string | string[]): RegExp {
  if (Array.isArray(alias)) {
    const allAliases: string = alias.join('|')
    return new RegExp(`^(!.*?):\\s*(\\$(${allAliases}))$`, 'gim')
  }

  return new RegExp(`^!(!.*?):\\s*(\\$${alias})$`, 'gim')
}

export const AriaCompileVar: Record<string, IAriaPlaceholder> = {
  filename: {
    alias: 'file',
    pattern: generatePattern('file')
  },
  version: {
    alias: ['version', 'v'],
    pattern: generatePattern(['version', 'v'])
  },
  entries: {
    alias: 'entries',
    pattern: generatePattern(['entries', 'count'])
  },
  lastModified: {
    alias: ['now', 'date'],
    pattern: generatePattern(['date', 'now'])
  }
}
