import { PathLike, writeFileSync } from 'node:fs'
import { AriaNode } from './AriaNode.mjs'
import { join } from 'node:path'

export class AriaAst {
  #nodes: AriaNode[]
  #nodesCount: number

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
  }

  get nodesCount(): number {
    return this.#nodesCount
  }

  public addNode(node: AriaNode): void {
    this.#nodes.push(node)
    this.#nodesCount++
  }

  public export(path: PathLike): boolean {
    try {
      if (path) {
        writeFileSync(join(path.toString(), 'ast.json'), JSON.stringify(this.#nodes))
        return true
      }
    } catch (e) {
      throw e
    }

    return false
  }
}
