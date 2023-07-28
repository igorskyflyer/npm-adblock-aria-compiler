import { IAriaPlaceholder } from '../models/IAriaPlaceholder.mjs'

function generatePattern(alias: string | string[]): RegExp {
  if (alias instanceof Array) {
    const allAliases: string = alias.join('|')
    return new RegExp(`\\$\\((?:${allAliases})\\)$`, 'gim')
  } else {
    return new RegExp(`\\$\\(${alias}\\)$`, 'gim')
  }
}

export const AriaCompileVar: Record<string, IAriaPlaceholder> = {
  filename: {
    alias: 'file',
    pattern: generatePattern('file'),
    value: '',
  },
  version: {
    alias: ['version', 'v'],
    pattern: generatePattern(['version', 'v']),
    value: '',
  },
  entries: {
    alias: 'entries',
    pattern: generatePattern(['entries', 'count']),
    value: '',
  },
  lastModified: {
    alias: ['now', 'date'],
    pattern: generatePattern(['date', 'now']),
    value: '',
  },
}
