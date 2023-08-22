import { IAriaFlag } from './IAriaFlag.mjs'

export const AriaFlag: Record<string, IAriaFlag> = {
  sort: {
    name: 'sort',
    allowsParams: true,
    paramValues: ['asc', 'desc'],
    defaultValue: 'asc',
  },
  dedupe: {
    name: 'dedupe',
    allowsParams: false,
  },
  trim: {
    name: 'trim',
    allowsParams: false,
  },
  strip: {
    name: 'strip',
    allowsParams: true,
    paramValues: ['modifiers', 'comments'],
  },
  append: {
    name: 'append',
    allowsParams: true,
    paramValues: ['*'],
    defaultValue: '',
  },
} as const
