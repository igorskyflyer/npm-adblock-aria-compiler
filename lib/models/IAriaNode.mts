import type { AriaNodeType } from './AriaNodeType.mjs'
import type { IAriaAction } from './IAriaAction.mjs'

export interface IAriaNode {
  type: AriaNodeType
  line: number
  index: number
  value?: string
  actions?: IAriaAction[]
}
