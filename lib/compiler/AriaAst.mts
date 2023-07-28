import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { PathLike, accessSync, readFileSync, writeFileSync } from 'node:fs'
import { join, parse, resolve } from 'node:path'
import { AriaAstPath } from '../models/AriaAstPath.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaPlaceholders } from '../models/IAriaPlaceholders.mjs'
import { IAriaState } from '../models/IAriaState.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { AriaPlaceholderData } from '../utils/AriaPlaceholderData.mjs'
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
    this.#state = { imports: 0, exports: 0 }
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
        path = join(path, '.json') as AriaAstPath
      }

      writeFileSync(path, JSON.stringify(this.#nodes), { encoding: 'utf8', flag: 'w' })
      return true
    } catch {}

    return false
  }

  public compile(): boolean {
    if (this.#nodesCount === 0) return true

    if (this.#state.exports === 0) {
      AriaLog.textError(AriaException.exportNotSpecified.message)
      AriaLog.newline()
      AriaLog.text('Aborting the compilation...')
      return false
    }

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
            contents += this.#block(`! ${node.value}`)
          }
          break
        }

        case AriaNodeType.nodeHeader: {
          const path: string | undefined = node.value

          try {
            if (path && this.#pathExists(path)) {
              let header: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
              header = injectVersionPlaceholder(header)
              contents += this.#block(header)
            } else {
              throw AriaLog.ariaError(AriaException.headerRead, -1, resolve(path!))
            }
          } catch {
            throw AriaLog.ariaError(AriaException.headerRead, -1, resolve(path!))
          }

          break
        }

        case AriaNodeType.nodeImport: {
          const path: string | undefined = node.value

          try {
            if (path && this.#pathExists(path)) {
              const filter: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
              contents += filter
            } else {
              throw AriaLog.ariaError(AriaException.filterNotFound, -1, path)
            }
          } catch {
            throw AriaLog.ariaError(AriaException.filterRead, -1, path)
          }

          break
        }

        case AriaNodeType.nodeExport: {
          const path: string | undefined = node.value

          try {
            if (path) {
              const filename: string = parse(path).name
              const placeholders: IAriaPlaceholders = AriaPlaceholderData

              placeholders.filename!.value = this.meta.title || filename
              placeholders.description!.value = this.meta.description! ?? ''
              placeholders.version!.value = ''
              placeholders.entries!.value = 0
              placeholders.lastModified!.value = getCurrentISOTime()

              if (this.#pathExists(path)) {
                const oldFile: string = new NormalizedString(readFileSync(path, { encoding: 'utf-8' })).value
                const oldVersion: string = constructVersion(oldFile, this.meta.versioning || this.versioning)
                placeholders.version!.value = oldVersion
              } else {
                contents = transformHeader(contents, this.versioning)
              }

              placeholders.entries!.value = countRules(contents)

              contents = replacePlaceholders(contents, placeholders)
              writeFileSync(path, new NormalizedString(contents).value, { encoding: 'utf8', flag: 'w' })

              AriaLog.textSuccess(`written ${chalk.bold(placeholders.entries?.value)} rules to "${parse(path).base}"`)
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
