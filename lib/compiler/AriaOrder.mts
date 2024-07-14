import type { IAriaNode } from '../models/IAriaNode.mjs'

// not allowed after the node
export const AriaOrder = {
  'Aria.Comment': [],
  'Aria.Tag': [],
  'Aria.Newline': [],
  'Aria.Header': ['Aria.Header'],
  'Aria.Implement': ['Aria.Implement'],
  'Aria.Meta': ['Aria.Implement', 'Aria.Header'],
  'Aria.Include': ['Aria.Implement', 'Aria.Header', 'Aria.Meta'],
  'Aria.Import': ['Aria.Implement', 'Aria.Header', 'Aria.Meta'],
  'Aria.Export': null
} as const

export function canAddNode(current: IAriaNode, previous: IAriaNode): boolean {
  const order: readonly string[] | null | undefined = AriaOrder[previous.type]

  if (!order || order == null) {
    return false
  }

  if (Array.isArray(order)) {
    if (order.length === 0) {
      return true
    }

    return !order.includes(current.type)
  }

  return true
}
