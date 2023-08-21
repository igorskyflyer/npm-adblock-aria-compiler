import { AriaNodeType } from './AriaNodeType.mjs'
import { IAriaFlag } from './IAriaFlag.mjs'

export interface IAriaNode {
  type: AriaNodeType
  line: number
  value?: string
  flags?: IAriaFlag[]
}
