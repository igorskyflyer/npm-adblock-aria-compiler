import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

export type AriaNode = {
  type: AriaNodeType
  position: AriaSourcePosition
  value?: string
  flags?: string[]
}
