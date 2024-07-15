import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { u } from '@igor.dvlpr/upath'
import chalk from 'chalk'
import { accessSync, readFileSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, parse, resolve } from 'node:path'
import { ARIA_UI_CODE_LINE_FEED } from '../constants/AriaUi.mjs'
import { AriaErrorString } from '../errors/AriaErrorString.mjs'
import type { AriaAstPath } from '../models/AriaAstPath.mjs'
import { AriaInlineMeta } from '../models/AriaInlineMeta.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import type { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import type { IAriaAction } from '../models/IAriaAction.mjs'
import type { IAriaMeta } from '../models/IAriaMeta.mjs'
import type { IAriaNode } from '../models/IAriaNode.mjs'
import type { IAriaState } from '../models/IAriaState.mjs'
import type { IAriaVar } from '../models/IAriaVar.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { AriaPerformance } from '../utils/AriaPerformance.mjs'
import { applyTransform } from '../utils/AriaTransform.mjs'
import { amendExpires, createVars } from '../utils/AriaVarUtils.mjs'
import {
  type AriaVersioning,
  constructVersion,
  createHeader,
  getCurrentISOTime,
  injectEntriesPlaceholder,
  injectVersionPlaceholder,
  replacePlaceholders,
  setHeaderVersion
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
    this.#state = { imports: [], exports: [], hasImplement: false }
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

    if (value.charCodeAt(value.length - 1) !== ARIA_UI_CODE_LINE_FEED) {
      return `${value}\n`
    }

    return value
  }

  #hasNode(node: AriaNodeType): boolean {
    if (this.#nodesCount === 0) {
      return false
    }

    for (let i = 0; i < this.#nodesCount; i++) {
      if (this.#nodes.at(i)?.type === node) {
        return true
      }
    }

    return false
  }

  #applyRoot(filepath: string): string {
    if (isAbsolute(filepath)) {
      return u(filepath)
    }

    return u(join(this.root, filepath))
  }

  removeNodes(nodeTypes: AriaNodeType[]): IAriaNode[] {
    return this.nodes.filter((current: IAriaNode) => {
      return !nodeTypes.includes(current.type)
    })
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

  public getNodes(node: AriaNodeType): IAriaNode[] {
    if (this.#nodesCount === 0) {
      return []
    }

    const result: IAriaNode[] = []

    for (let i = 0; i < this.#nodesCount; i++) {
      if (this.nodes[i].type === node) {
        result.push(this.nodes[i])
      }
    }

    return result
  }

  public addNode(node: IAriaNode, sourceline: number): void {
    if (this.nodesCount > 1) {
      const previous: IAriaNode | undefined = this.nodes.at(-1)

      if (previous && !canAddNode(node, previous)) {
        throw AriaLog.ariaThrow(
          AriaErrorString.syntaxOrder,
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
      } else if (node.type === AriaNodeType.nodeImplement) {
        this.#state.hasImplement = true
      }
    }

    node.index = this.#nodesCount

    this.#nodes.push(node)
    this.#nodesCount++
  }

  public implementNodes(nodes: IAriaNode[], sourceline: number): void {
    const count: number = nodes.length

    for (let i = 0; i < count; i++) {
      this.addNode(nodes[i], sourceline)
    }
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
        flag: 'w'
      })
      return true
    } catch {}

    return false
  }

  public compile(): boolean {
    if (this.#nodesCount === 0) return true

    if (this.#state.exports.length === 0) {
      AriaLog.error(AriaErrorString.exportNotSpecified)
      AriaLog.newline()
      AriaLog.text(AriaErrorString.abortCompilation)
      return false
    }

    const hasHeader: boolean = this.#hasNode(AriaNodeType.nodeHeader)
    let header: string = ''
    let contents: string = ''

    if (!hasHeader) {
      AriaLog.warning(AriaErrorString.headerMissing)
      AriaLog.newline()
      header = createHeader()

      contents += this.#block(header)
    }

    const perf: AriaPerformance = new AriaPerformance()
    const variables: IAriaVar = createVars()

    // external meta vars
    variables.title = this.meta.title ?? ''
    variables.description = this.meta.description ?? ''
    variables.expires = amendExpires(this.meta.expires) ?? ''

    perf.startProfiling()

    for (let i = 0; i < this.#nodesCount; i++) {
      const node: IAriaNode = this.#nodes[i]

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
                header = new NormalizedString(
                  readFileSync(finalPath, { encoding: 'utf-8' })
                ).value
                header = injectVersionPlaceholder(header)
                header = injectEntriesPlaceholder(header)

                contents += this.#block(header)
              } else {
                throw AriaLog.ariaThrow(
                  AriaErrorString.headerRead,
                  -1,
                  resolve(path)
                )
              }
            }
          } catch {
            throw AriaLog.ariaThrow(
              AriaErrorString.headerRead,
              -1,
              path ?? 'N/A'
            )
          }

          break
        }

        case AriaNodeType.nodeMeta: {
          if (node.actions && node.actions.length === 1) {
            const metaAction: IAriaAction = node.actions[0]
            const metaProp: string = metaAction.name

            if (metaProp in AriaInlineMeta && metaAction.actualValue) {
              AriaInlineMeta[metaProp as keyof typeof AriaInlineMeta] =
                metaAction.actualValue
            }

            // inline meta vars
            if (AriaInlineMeta.title.length > 0) {
              variables.title = AriaInlineMeta.title
            }

            if (AriaInlineMeta.description.length > 0) {
              variables.description = AriaInlineMeta.description
            }

            if (AriaInlineMeta.expires.length > 0) {
              variables.expires = amendExpires(AriaInlineMeta.expires)
            }
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

                    AriaLog.log(
                      AriaErrorString.actionApplying,
                      transformName,
                      path
                    )

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
                AriaLog.logNewline()
              } else {
                throw AriaLog.ariaThrow(
                  AriaErrorString.filterNotFound,
                  -1,
                  path
                )
              }
            }
          } catch {
            throw AriaLog.ariaThrow(
              AriaErrorString.filterRead,
              -1,
              path ?? 'N/A'
            )
          }

          break
        }

        case AriaNodeType.nodeImplement: {
          break
        }

        case AriaNodeType.nodeExport: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              const finalPath: string = this.#applyRoot(path)
              let oldCount: number = -1
              let oldLength: number = 0

              // compile vars
              variables.filename = parse(path).name
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
                contents = setHeaderVersion(contents, newVersion)
                oldCount = countRules(oldFile)
                oldLength = oldFile.length
              } else {
                contents = setHeaderVersion(contents, this.versioning)
              }

              if (!hasHeader) {
                variables.expires = amendExpires('24h')
              }

              contents = replacePlaceholders(contents, variables)
              contents = contents.trimEnd()

              if (contents.at(-1) !== '\n') {
                contents += '\n'
              }

              writeFileSync(finalPath, new NormalizedString(contents).value, {
                encoding: 'utf8',
                flag: 'w'
              })

              AriaLog.success(
                `Written ${chalk.bold(
                  variables.entries
                )} rules ${AriaLog.formatChanges(
                  oldCount,
                  variables.entries,
                  oldLength,
                  contents.length
                )} to "${finalPath}".`
              )
            } else {
              throw AriaLog.ariaThrow(AriaErrorString.exportInvalid)
            }
          } catch {
            throw AriaLog.ariaThrow(
              AriaErrorString.exportUnsuccessful,
              -1,
              path
            )
          }

          break
        }
      }
    }

    const time: string = perf.endProfiling()

    AriaLog.newline()
    AriaLog.text(chalk.dim(`🚀 Compiled in ${time} 💫`))

    return true
  }
}
