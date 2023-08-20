import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { PathLike, accessSync, readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, parse, resolve } from 'node:path'
import { AriaAstPath } from '../models/AriaAstPath.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaState } from '../models/IAriaState.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import {
  AriaVersioning,
  constructVersion,
  getCurrentISOTime,
  injectVersionPlaceholder,
  replacePlaceholders,
  transformHeader,
} from '../utils/AriaVersioning.mjs'
import { AriaException } from '../errors/AriaException.mjs'
import chalk from 'chalk'
import { IAriaVar } from '../models/IAriaVar.mjs'
import { createVars } from '../utils/AriaVarUtils.mjs'
import { AriaPerformance } from '../utils/AriaPerformance.mjs'

export class AriaAst {
  #nodes: IAriaNode[]
  #nodesCount: number
  #state: IAriaState
  templatePath: AriaTemplatePath
  root: string
  meta: IAriaMeta
  versioning: AriaVersioning
  tagsCounter: number

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
    this.#state = { imports: [], exports: [] }
    this.templatePath = '' as AriaTemplatePath
    this.root = ''
    this.versioning = 'auto'
    this.meta = { description: '', title: '', versioning: 'auto' }
    this.tagsCounter = 0
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

  get nodes(): IAriaNode[] {
    return this.#nodes
  }

  get state(): IAriaState {
    return this.#state
  }

  public addNode(node: IAriaNode): void {
    if (typeof node.value === 'string') {
      if (node.type === AriaNodeType.nodeImport) {
        this.#state.imports.push(node.value)
      } else if (node.type === AriaNodeType.nodeExport) {
        this.#state.exports.push(node.value)
      }
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
        path = join(path, '.json') as AriaAstPath
      }

      writeFileSync(path, JSON.stringify(this.#nodes), {
        encoding: 'utf8',
        flag: 'w',
      })
      return true
    } catch {}

    return false
  }

  #applyRoot(filepath: string): string {
    if (isAbsolute(filepath)) {
      return filepath
    }

    return join(this.root, filepath)
  }

  public compile(): boolean {
    if (this.#nodesCount === 0) return true

    if (this.#state.exports.length === 0) {
      AriaLog.textError(AriaException.exportNotSpecified.message)
      AriaLog.newline()
      AriaLog.text('Aborting the compilation...')
      return false
    }

    const perf: AriaPerformance = new AriaPerformance()
    let contents = ''

    perf.startProfiling()

    for (let i = 0; i < this.#nodesCount; i++) {
      const node = this.#nodes[i]

      switch (node.type) {
        case AriaNodeType.nodeNewLine: {
          contents += String.fromCharCode(10)
          break
        }

        case AriaNodeType.nodeComment: {
          if (node.value) {
            contents += this.#block(`! ${node.value}`)
          }
          break
        }

        case AriaNodeType.nodeTag: {
          if (node.value) {
            contents += this.#block(`! {@${this.tagsCounter++}} ${node.value}`)
          }
          break
        }

        case AriaNodeType.nodeHeader: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              const finalPath: string = this.#applyRoot(path)

              if (this.#pathExists(finalPath)) {
                let header: string = new NormalizedString(
                  readFileSync(finalPath, { encoding: 'utf-8' })
                ).value
                header = injectVersionPlaceholder(header)
                contents += this.#block(header)
              } else {
                throw AriaLog.ariaError(
                  AriaException.headerRead,
                  -1,
                  resolve(path)
                )
              }
            }
          } catch {
            throw AriaLog.ariaError(AriaException.headerRead, -1, path ?? 'N/A')
          }

          break
        }

        case AriaNodeType.nodeImport: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              const finalPath: string = this.#applyRoot(path)

              if (this.#pathExists(finalPath)) {
                const filter: string = new NormalizedString(
                  readFileSync(finalPath, { encoding: 'utf-8' })
                ).value
                contents += filter
              } else {
                throw AriaLog.ariaError(AriaException.filterNotFound, -1, path)
              }
            }
          } catch {
            throw AriaLog.ariaError(AriaException.filterRead, -1, 'N/A')
          }

          break
        }

        case AriaNodeType.nodeExport: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              const filename: string = parse(path).name
              const variables: IAriaVar = createVars()
              const finalPath: string = this.#applyRoot(path)
              let oldCount: number = -1

              // meta vars
              variables.title = this.meta.title ?? ''
              variables.description = this.meta.description ?? ''
              variables.expires = this.meta.expires ?? ''

              // compile vars
              variables.filename = filename
              variables.version = ''
              variables.entries = 0
              variables.lastModified = getCurrentISOTime()
              variables.entries = countRules(contents)

              if (this.#pathExists(finalPath)) {
                const oldFile: string = new NormalizedString(
                  readFileSync(finalPath, { encoding: 'utf-8' })
                ).value
                const newVersion: string = constructVersion(
                  oldFile,
                  this.meta.versioning || this.versioning
                )
                variables.version = newVersion
                contents = transformHeader(contents, newVersion)
                oldCount = countRules(oldFile)
              } else {
                contents = transformHeader(contents, this.versioning)
              }

              contents = replacePlaceholders(contents, variables)

              writeFileSync(finalPath, new NormalizedString(contents).value, {
                encoding: 'utf8',
                flag: 'w',
              })

              AriaLog.textSuccess(
                `written ${chalk.bold(
                  variables.entries
                )} rules ${AriaLog.formatChanges(
                  oldCount,
                  variables.entries
                )} to "${finalPath}".`
              )
            } else {
              throw AriaLog.ariaError(AriaException.exportInvalid)
            }
          } catch {
            throw AriaLog.ariaError(AriaException.exportUnsuccessful, -1, path)
          }

          break
        }
      }
    }

    const time: string = perf.endProfiling()

    AriaLog.newline()
    AriaLog.text(chalk.dim(`🚀 Finished in ${time} 💫`))

    return true
  }
}
