import { AriaNode } from './AriaNode.mjs'
import { AriaState } from './AriaState.mjs'

export type AriaAst = {
  nodesCount: number
  nodes: AriaNode[]
  _state: AriaState
}
