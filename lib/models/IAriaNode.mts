import { AriaNodeType } from './AriaNodeType.mjs'

export interface IAriaNode {
  type: AriaNodeType
  line: number
  value?: string
  flags?: string[]
}
