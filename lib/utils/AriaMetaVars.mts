import { IAriaPlaceholder } from '../models/IAriaPlaceholder.mjs'

function generatePattern(label: string, alias: string | string[]): RegExp {
  if (alias instanceof Array) {
    const allAliases: string = alias.join('|')
    return new RegExp(`! ${label}: \\$\\((?:${allAliases})\\)$`, 'gim')
  } else {
    return new RegExp(`! ${label}: \\$\\(${alias}\\)$`, 'gim')
  }
}

export const AriaMetaVars: Record<string, IAriaPlaceholder> = {
  filename: {
    label: 'Title',
    alias: 'file',
    pattern: generatePattern('Title', 'title'),
    value: '',
  },
  description: {
    label: 'Description',
    alias: ['description', 'about'],
    pattern: generatePattern('Description', ['description', 'about']),
    value: '',
  },
}
