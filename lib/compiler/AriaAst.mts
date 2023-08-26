import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { u } from '@igor.dvlpr/upath'
import chalk from 'chalk'
import { accessSync, readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, parse, resolve } from 'node:path'
import { AriaString } from '../errors/AriaString.mjs'
import { AriaAstPath } from '../models/AriaAstPath.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaAction } from '../models/IAriaAction.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { IAriaState } from '../models/IAriaState.mjs'
import { IAriaVar } from '../models/IAriaVar.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { AriaPerformance } from '../utils/AriaPerformance.mjs'
import { applyTransform } from '../utils/AriaTransform.mjs'
import { createVars } from '../utils/AriaVarUtils.mjs'
import {
  AriaVersioning,
  constructVersion,
  getCurrentISOTime,
  injectEntriesPlaceholder,
  injectVersionPlaceholder,
  replacePlaceholders,
  transformHeader,
} from '../utils/AriaVersioning.mjs'
import { getKeywordFromType } from './AriaKeywords.mjs'
import { canAddNode } from './AriaOrder.mjs'

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

  #pathExists(path: string): boolean {
    try {
      accessSync(u(path))
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

  public addNode(node: IAriaNode, sourceline: number): void {
    if (this.nodesCount > 1) {
      const previous: IAriaNode | undefined = this.nodes.at(-1)

      if (previous && !canAddNode(node, previous)) {
        throw AriaLog.ariaError(
          AriaString.syntaxOrder,
          sourceline,
          getKeywordFromType(node.type),
          getKeywordFromType(previous.type)
        )
      }
    }

    if (typeof node.value === 'string') {
      if (
        node.type === AriaNodeType.nodeInclude ||
        node.type === AriaNodeType.nodeImport
      ) {
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
      path = u(path) as AriaAstPath

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
      return u(filepath)
    }

    return u(join(this.root, filepath))
  }

  public compile(): boolean {
    if (this.#nodesCount === 0) return true

    if (this.#state.exports.length === 0) {
      AriaLog.textError(AriaString.exportNotSpecified.message)
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
          } else {
            contents += this.#block(`! {@${this.tagsCounter++}}`)
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
                header = injectEntriesPlaceholder(header)
                contents += this.#block(header)
              } else {
                throw AriaLog.ariaError(
                  AriaString.headerRead,
                  -1,
                  resolve(path)
                )
              }
            }
          } catch {
            throw AriaLog.ariaError(AriaString.headerRead, -1, path ?? 'N/A')
          }

          break
        }

        case AriaNodeType.nodeInclude:
        case AriaNodeType.nodeImport: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              const finalPath: string = this.#applyRoot(path)

              if (this.#pathExists(finalPath)) {
                let filter: string = new NormalizedString(
                  readFileSync(finalPath, { encoding: 'utf-8' })
                ).value

                if (node.type === AriaNodeType.nodeImport) {
                  contents += `! *** ${path} ***\n`
                }

                if (node.actions) {
                  const count: number = node.actions.length

                  for (let i = 0; i < count; i++) {
                    const action: IAriaAction = node.actions[i]
                    const transformName: string = action.name

                    if (action.allowsParams) {
                      filter = applyTransform(
                        transformName,
                        filter,
                        action.actualValue
                      )
                    } else {
                      filter = applyTransform(transformName, filter)
                    }
                  }
                }

                contents += filter
              } else {
                throw AriaLog.ariaError(AriaString.filterNotFound, -1, path)
              }
            }
          } catch {
            throw AriaLog.ariaError(AriaString.filterRead, -1, path ?? 'N/A')
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
              throw AriaLog.ariaError(AriaString.exportInvalid)
            }
          } catch {
            throw AriaLog.ariaError(AriaString.exportUnsuccessful, -1, path)
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
