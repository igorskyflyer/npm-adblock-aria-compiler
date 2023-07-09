import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { PathLike, accessSync, readFileSync, writeFileSync } from 'node:fs'
import { join, parse } from 'node:path'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaState } from './AriaState.mjs'
import {
  AriaVersioning,
  constructVersion,
  getCurrentISOTime,
  injectVersionPlaceholder,
  replacePlaceholders,
  transformHeader,
} from './AriaVersioning.mjs'
import { IAriaPlaceholders } from './IAriaPlaceholders.mjs'
import { countRules } from '@igor.dvlpr/adblock-filter-counter'

type AriaAstPath = `${string}.json`

export class AriaAst {
  #nodes: AriaNode[]
  #nodesCount: number
  #state: AriaState

  versioning: AriaVersioning

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
    this.#state = { imports: 0, exports: 0 }

    this.versioning = 'semver'
  }

  #pathExists(path: PathLike): boolean {
    try {
      accessSync(path)
      return true
    } catch {}
    return false
  }

  #block(value: string): string {
    if (typeof value !== 'string') {
      return ''
    }

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

      writeFileSync(path, JSON.stringify(this.#nodes), { encoding: 'utf8', flag: 'w' })
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
              let header: string = new NormalizedString(readFileSync(path).toString()).value
              header = injectVersionPlaceholder(header)
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
              const filter: string = new NormalizedString(readFileSync(path).toString()).value
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
              const filename: string = parse(path).name
              const placeholders: IAriaPlaceholders = {
                filename: filename,
                version: '',
                entries: 0,
                lastModified: getCurrentISOTime(),
              }

              if (this.#pathExists(path)) {
                const oldFile: string = new NormalizedString(readFileSync(path).toString()).value
                const oldVersion: string = constructVersion(oldFile, this.versioning)
                placeholders.version = oldVersion
              } else {
                contents = transformHeader(contents, this.versioning)
              }

              placeholders.entries = countRules(contents)

              contents = replacePlaceholders(contents, placeholders)
              writeFileSync(path, new NormalizedString(contents).value, { encoding: 'utf8', flag: 'w' })
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
