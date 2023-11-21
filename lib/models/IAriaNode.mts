import { AriaAst } from '../compiler/AriaAst.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { IAriaAction } from './IAriaAction.mjs'

export interface IAriaNode {
  type: AriaNodeType
  line: number
  index: number
  value?: string
  actions?: IAriaAction[]
  subnodes?: AriaAst
}
