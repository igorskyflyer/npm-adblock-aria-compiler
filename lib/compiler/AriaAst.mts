import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { PathLike, accessSync, readFileSync, writeFileSync } from 'node:fs'
import { join, parse, resolve } from 'node:path'
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
  meta: IAriaMeta

  versioning: AriaVersioning

  constructor() {
    this.#nodesCount = 0
    this.#nodes = []
    this.#state = { imports: [], exports: [] }
    this.templatePath = '' as AriaTemplatePath
    this.versioning = 'auto'
    this.meta = { description: '', title: '', versioning: 'auto' }
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

      writeFileSync(path, JSON.stringify(this.#nodes), { encoding: 'utf8', flag: 'w' })
      return true
    } catch {}

    return false
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

        case AriaNodeType.nodeHeader: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              if (this.#pathExists(path)) {
                let header: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
                header = injectVersionPlaceholder(header)
                contents += this.#block(header)
              } else {
                throw AriaLog.ariaError(AriaException.headerRead, -1, resolve(path))
              }
            }
          } catch {
            throw AriaLog.ariaError(AriaException.headerRead, -1, 'N/A')
          }

          break
        }

        case AriaNodeType.nodeImport: {
          const path: string | undefined = node.value

          try {
            if (typeof path === 'string') {
              if (this.#pathExists(path)) {
                const filter: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
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
            if (path) {
              const filename: string = parse(path).name
              const variables: IAriaVar = createVars()

              // meta vars
              variables.title = this.meta.title ?? ''
              variables.description = this.meta.description ?? ''

              // compile vars
              variables.filename = filename
              variables.version = ''
              variables.entries = 0
              variables.lastModified = getCurrentISOTime()
              variables.entries = countRules(contents)

              if (this.#pathExists(path)) {
                const oldFile: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
                const newVersion: string = constructVersion(oldFile, this.meta.versioning || this.versioning)
                variables.version = newVersion
                contents = transformHeader(contents, newVersion)
              } else {
                contents = transformHeader(contents, this.versioning)
              }

              contents = replacePlaceholders(contents, variables)

              writeFileSync(path, new NormalizedString(contents).value, { encoding: 'utf8', flag: 'w' })

              const time: string = perf.endProfiling()

              AriaLog.textSuccess(`written ${chalk.bold(variables.entries)} rules to "${parse(path).base}" in ${time}`)
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

    return true
  }
}
