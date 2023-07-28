import { IAriaMetaVar } from '../models/IAriaMetaVar.mjs'

function generatePattern(alias: string | string[]): RegExp {
  if (alias instanceof Array) {
    const allAliases: string = alias.join('|')
    return new RegExp(`\\$\\{(?:${allAliases})\\}`, 'gim')
  } else {
    return new RegExp(`\\$\\{${alias}\\}`, 'gim')
  }
}

export const AriaMetaVars: Record<string, IAriaMetaVar> = {
  filename: {
    alias: 'file',
    pattern: generatePattern('title'),
    value: '',
  },
  description: {
    alias: ['description', 'about'],
    pattern: generatePattern(['description', 'about']),
    value: '',
  },
}
