import { PathLike, writeFileSync } from 'node:fs'
import { AriaNode } from './AriaNode.mjs'
import { join } from 'node:path'

export class AriaAst {
  public nodesCount: number
  public nodes: AriaNode[]

  constructor() {
    this.nodesCount = 0
    this.nodes = []
  }

  public export(path: PathLike): boolean {
    try {
      if (path) {
        writeFileSync(join(path.toString(), 'ast.json'), JSON.stringify(this.nodes))
        return true
      }
    } catch (e) {
      throw e
    }

    return false
  }
}
