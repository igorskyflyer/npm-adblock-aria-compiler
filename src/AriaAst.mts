import { PathLike, accessSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { AriaNode } from './AriaNode.mjs'
import { AriaState } from './AriaState.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaHeaderVersion, constructSemVer } from './AriaHeaderVersion.mjs'

type AriaAstPath = `${string}.json`

export class AriaAst {
  #nodes: AriaNode[]
  #nodesCount: number
  #state: AriaState

  headerVersion: AriaHeaderVersion

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
    this.#state = { imports: 0, exports: 0 }

    this.headerVersion = 'semver'
  }

  #pathExists(path: PathLike): boolean {
    try {
      accessSync(path)
      return true
    } catch {}
    return false
  }

  #block(value: string): string {
    if (typeof value !== 'string') return ''

    if (value.trim().length === 0) {
      return ''
    }

    if (value.charCodeAt(value.length - 1) !== 10) {
      return `${value}\n`
    }

    return value
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

  public setHeaderVersion(version: AriaHeaderVersion): void {
    this.headerVersion = version
  }

  public addNode(node: AriaNode): void {
    if (node.type === AriaNodeType.nodeImport) {
      this.#state.imports++
    } else if (node.type === AriaNodeType.nodeExport) {
      this.#state.exports++
    }

    // 👇🏼 normalize line number (internal -> source)
    node.line++
    this.#nodes.push(node)
    this.#nodesCount++
  }

  public export(path: AriaAstPath): boolean {
    if (typeof path !== 'string') {
      return false
    }

    try {
      if (!path.toLowerCase().endsWith('.json')) {
        path = join(path, '.json') as AriaAstPath
      }

      writeFileSync(path, JSON.stringify(this.#nodes))
      return true
    } catch {}

    return false
  }

  public compile(): boolean {
    if (this.#nodesCount === 0) return true

    let contents = ''

    for (let i = 0; i < this.#nodesCount; i++) {
      const node = this.#nodes[i]

      switch (node.type) {
        case AriaNodeType.nodeNewLine: {
          contents += String.fromCharCode(10)
          break
        }

        case AriaNodeType.nodeComment: {
          if (node.value) {
            contents += this.#block(node.value)
          }
          break
        }

        case AriaNodeType.nodeHeader: {
          const path: string | undefined = node.value

          try {
            if (path && this.#pathExists(path)) {
              const header = readFileSync(path).toString()
              console.log(constructSemVer(header))
              contents += this.#block(header)
            } else {
              throw new Error(`Couldn't read the header file located at: "${path}".`)
            }
          } catch {
            throw new Error(`Couldn't read the header file located at: "${path}".`)
          }

          break
        }

        case AriaNodeType.nodeImport: {
          const path: string | undefined = node.value

          try {
            if (path && this.#pathExists(path)) {
              const filter = readFileSync(path).toString()
              contents += filter
            } else {
              throw new Error(`Couldn't read the filter file located at: "${path}".`)
            }
          } catch {
            throw new Error(`Couldn't read the filter file located at: "${path}".`)
          }

          break
        }

        case AriaNodeType.nodeExport: {
          const path: string | undefined = node.value

          try {
            if (path) {
              if (this.#pathExists(path)) {
                throw new Error(`File marked as export "${path}" already exists!`)
              } else {
                writeFileSync(path, contents)
              }
            } else {
              throw new Error(`Invalid export path!`)
            }
          } catch {
            throw new Error(`Couldn't export to file "${path}"!`)
          }

          break
        }
      }
    }

    return false
  }
}
