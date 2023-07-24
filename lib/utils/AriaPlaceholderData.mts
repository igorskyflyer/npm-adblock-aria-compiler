import { IAriaPlaceholder } from '../types/IAriaPlaceholder.mjs'

function generatePattern(label: string, alias: string | string[]): RegExp {
  if (alias instanceof Array) {
    const allAliases: string = alias.join('|')
    return new RegExp(`! ${label}: \\$\\((?:${allAliases})\\)$`, 'gim')
  } else {
    return new RegExp(`! ${label}: \\$\\(${alias}\\)$`, 'gim')
  }
}

export const AriaPlaceholderData: Record<string, IAriaPlaceholder> = {
  filename: {
    label: 'Title',
    alias: 'file',
    pattern: generatePattern('Title', ['file', 'title']),
    value: '',
  },
  version: {
    label: 'Version',
    alias: ['version', 'v'],
    pattern: generatePattern('Version', ['version', 'v']),
    value: '',
  },
  entries: {
    label: 'Entries',
    alias: 'entries',
    pattern: generatePattern('Entries', ['entries', 'count']),
    value: '',
  },
  lastModified: {
    label: 'Last modified',
    alias: ['now', 'date'],
    pattern: generatePattern('Last modified', ['date', 'now']),
    value: '',
  },
  description: {
    label: 'Description',
    alias: ['description', 'about'],
    pattern: generatePattern('Description', ['description', 'about']),
    value: '',
  },
}
