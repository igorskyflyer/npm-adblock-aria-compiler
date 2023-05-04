import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

export type AriaNode = {
  type: AriaNodeType
  position: AriaSourcePosition
  operand?: string
  flags?: string[]
}
