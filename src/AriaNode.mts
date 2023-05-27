import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaRange } from './AriaRange.mjs'

export type AriaNode = {
  type: AriaNodeType
  line: number
  range: AriaRange
  value?: string
  flags?: string[]
}
