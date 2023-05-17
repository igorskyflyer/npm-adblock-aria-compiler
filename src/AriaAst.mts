import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { AriaNode } from './AriaNode.mjs'
import { AriaState } from './AriaState.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'

type AriaFilePath<extension extends string> = `${string}.${extension}`

type AriaAstPath = AriaFilePath<'json'>

export class AriaAst {
  #nodes: AriaNode[]
  #nodesCount: number
  #state: AriaState

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
    this.#state = { imports: 0, exports: 0 }
  }

  get nodesCount(): number {
    return this.#nodesCount
  }

  get nodes(): AriaNode[] {
    return this.#nodes
  }

  get state(): AriaState {
    return this.#state
  }

  public addNode(node: AriaNode): void {
    if (node.type === AriaNodeType.nodeImport) {
      this.#state.imports++
    } else if (node.type === AriaNodeType.nodeExport) {
      this.#state.exports++
    }

    this.#nodes.push(node)
    this.#nodesCount++
  }

  public export(path: AriaAstPath): boolean {
    if (typeof path !== 'string') {
      return false
    }

    try {
      if (!path.toLowerCase().endsWith('.json')) {
        // @ts-ignore
        path = join(path, '.json')
      }

      writeFileSync(path, JSON.stringify(this.#nodes))
      return true
    } catch {}

    return false
  }
}
