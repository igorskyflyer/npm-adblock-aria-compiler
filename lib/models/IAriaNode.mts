import { AriaNodeType } from './AriaNodeType.mjs'
import { IAriaAction } from './IAriaAction.mjs'

export interface IAriaNode {
  type: AriaNodeType
  line: number
  value?: string
  flags?: IAriaAction[]
}
