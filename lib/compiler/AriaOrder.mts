import { IAriaNode } from '../models/IAriaNode.mjs'

export const AriaOrder = {
  'Aria.Comment': [],
  'Aria.Tag': [],
  'Aria.Newline': [],
  'Aria.Header': [
    'Aria.Comment',
    'Aria.Tag',
    'Aria.Newline',
    'Aria.Header',
    'Aria.Include',
    'Aria.Import',
    'Aria.Export',
  ],
  'Aria.Include': [
    'Aria.Comment',
    'Aria.Tag',
    'Aria.Include',
    'Aria.Newline',
    'Aria.Import',
    'Aria.Export',
  ],
  'Aria.Import': [
    'Aria.Import',
    'Aria.Tag',
    'Aria.Newline',
    'Aria.Include',
    'Aria.Export',
  ],
  'Aria.Export': null,
} as const

export function canAddNode(current: IAriaNode, previous: IAriaNode): boolean {
  const order: readonly string[] | null | undefined = AriaOrder[previous.type]

  if (!order || order == null) {
    return false
  }

  if (order instanceof Array) {
    if (order.length === 0) {
      return true
    }

    return order.includes(current.type)
  }

  return true
}
