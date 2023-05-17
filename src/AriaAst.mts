import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { AriaNode } from './AriaNode.mjs'

type AriaFilePath<extension extends string> = `${string}.${extension}`

type AriaAstPath = AriaFilePath<'json'>

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

  public export(path: AriaAstPath): boolean {
    if (typeof path !== 'string') {
      return false
    }

    try {
      if (!path.toLowerCase().endsWith('.json')) {
        // @ts-ignore
        path = join(path, '.json')
      }

      console.log({ path })

      writeFileSync(path, JSON.stringify(this.#nodes))
      return true
    } catch {}

    return false
  }
}
