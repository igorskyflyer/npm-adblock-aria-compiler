import type { IAriaPlaceholder } from '../models/IAriaPlaceholder.mjs'

function generatePattern(alias: string | string[]): RegExp {
  if (Array.isArray(alias)) {
    const allAliases: string = alias.join('|')
    return new RegExp(`^(!.*?):\\s*(\\{(?:${allAliases})\\})$`, 'gim')
  }

  return new RegExp(`^(!.*?):\\s*(\\{${alias}\\})$`, 'gim')
}

export const AriaMetaVars: Record<string, IAriaPlaceholder> = {
  title: {
    alias: 'title',
    pattern: generatePattern('title')
  },
  description: {
    alias: ['description', 'about'],
    pattern: generatePattern(['description', 'about'])
  },
  expires: {
    alias: 'expires',
    pattern: generatePattern('expires')
  }
}
