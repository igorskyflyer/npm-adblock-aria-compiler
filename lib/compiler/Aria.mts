import { NormalizedString } from '@igor.dvlpr/normalized-string'
import chalk from 'chalk'
import { PathLike, accessSync, readFileSync } from 'fs'
import { resolve } from 'node:path'
import { parse } from 'path'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaException } from '../errors/AriaException.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { IAriaOptions } from '../models/IAriaOptions.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { getMetaPath, hasMeta, parseMeta } from '../utils/AriaVarUtils.mjs'
import { AriaAst } from './AriaAst.mjs'
import { AriaKeywords } from './AriaKeywords.mjs'

export class Aria {
  #source: string
  // global
  #line: string
  #char: string

  // per-line
  #lineCursor: number
  #lineLength: number
  #cursorInLine: number
  #buffer: string
  #foundKeyword: boolean

  #ast: AriaAst

  constructor(options: IAriaOptions) {
    this.#source = ''
    this.#line = ''
    this.#char = ''
    this.#buffer = ''
    this.#foundKeyword = false
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0
    this.#ast = new AriaAst()
    this.#ast.versioning = options.versioning ?? 'auto'

    AriaLog.shouldLog = options.shouldLog ?? false
  }

  #sourceLine(): number {
    return this.#lineCursor + 1
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): IAriaNode {
    this.#foundKeyword = true

    const node: IAriaNode = {
      type,
      line: this.#sourceLine(),
    }

    if (typeof value === 'string') {
      node.value = value
    }

    if (flags instanceof Array && flags.length > 0) {
      node.flags = flags
    }

    return node
  }

  #read(count: number = 1): boolean {
    if (this.#cursorInLine + count < this.#lineLength) {
      this.#cursorInLine += count
      this.#char = this.#line.charAt(this.#cursorInLine)

      return true
    }
    return false
  }

  #chunk(start: number, end?: number): string {
    return this.#line.substring(start, end)
  }

  #parsePath(): string {
    let shouldCapture: boolean = false
    let closedString: boolean = false
    let path: string = ''

    while (this.#read()) {
      if (closedString) {
        throw AriaLog.ariaError(AriaException.extraneousInput, this.#sourceLine(), path)
      }

      if (!shouldCapture) {
        if (this.#isWhitespace()) continue
        if (this.#char === "'") {
          shouldCapture = true
        } else {
          throw AriaLog.ariaError(AriaException.importPath, this.#sourceLine(), this.#char)
        }
      } else {
        if (this.#char === '\\') {
          this.#read()
          path += this.#char
          continue
        }

        if (this.#char === "'") {
          shouldCapture = false
          closedString = true
        } else {
          path += this.#char
        }
      }
    }

    if (!closedString) {
      throw AriaLog.ariaError(AriaException.unterminatedPath, this.#sourceLine())
    }

    return path
  }

  #parseComment(): boolean {
    const comment: string = this.#chunk(1).trim()
    this.#ast.addNode(this.#node(AriaNodeType.nodeComment, comment))

    return true
  }

  #parseHeaderImport(): boolean {
    const path: string = this.#parsePath()
    this.#ast.addNode(this.#node(AriaNodeType.nodeHeader, path))

    return true
  }

  #parseImport(): boolean {
    const path: string = this.#parsePath()

    if (!this.#ast.state.imports.includes(path)) {
      this.#ast.addNode(this.#node(AriaNodeType.nodeImport, path))
    } else {
      AriaLog.textWarning(AriaException.importedAlready.message, path)
      AriaLog.newline()
    }

    return true
  }

  #parseExport(): boolean {
    const path: string = this.#parsePath()
    const flags: string[] = []

    this.#ast.addNode(this.#node(AriaNodeType.nodeExport, path, flags))

    return true
  }

  #reset(): void {
    this.#source = ''
    this.#line = ''
    this.#char = ''
    this.#buffer = ''
    this.#foundKeyword = false
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0

    const oldHeaderVersion = this.#ast.versioning
    this.#ast = new AriaAst()
    this.#ast.versioning = oldHeaderVersion
  }

  #isWhitespace(): boolean {
    return this.#char === ' ' || this.#char === '\t'
  }

  #pathExists(path: PathLike): boolean {
    try {
      accessSync(path)
      return true
    } catch {}
    return false
  }

  get ast(): AriaAst {
    return this.#ast
  }

  parse(source: string): AriaAst {
    this.#reset()
    this.#source = new NormalizedString(source).value

    const lines: string[] = this.#source.split(/\n/gm)
    const linesCount: number = lines.length

    AriaLog.log(`Total lines: ${linesCount}`)
    AriaLog.log(`Versioning: ${this.#ast.versioning}`)

    AriaLog.newline()

    while (this.#lineCursor < linesCount) {
      this.#line = lines[this.#lineCursor]
      this.#buffer = ''

      if (typeof this.#line !== 'string') break

      AriaLog.log(`Processing line: ${this.#sourceLine()}`)

      if (this.#line.trim().length === 0) {
        AriaLog.log(`Blank line, skipping`)
        AriaLog.logNewline()
        this.#lineCursor++
        continue
      }

      this.#lineLength = this.#line.length
      this.#foundKeyword = false

      for (this.#cursorInLine = 0; this.#cursorInLine < this.#lineLength; this.#cursorInLine++) {
        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#isWhitespace()) {
          continue
        }

        this.#buffer += this.#char

        if (this.#buffer === AriaKeywords.newLine) {
          this.#ast.addNode(this.#node(AriaNodeType.nodeNewLine))
          AriaLog.log('Found an explicit new line')
          break
        }

        if (this.#buffer === AriaKeywords.commentInternal) {
          this.#foundKeyword = true
          AriaLog.log(`Found internal comment at char(${this.#cursorInLine}), skipping line`)
          break
        }

        if (this.#buffer === AriaKeywords.commentExported) {
          this.#parseComment()
          AriaLog.log('Found exported comment')
          break
        }

        if (this.#buffer === AriaKeywords.headerImport) {
          this.#parseHeaderImport()
          AriaLog.log('Found header import operator')
          break
        }

        if (this.#buffer === AriaKeywords.import) {
          this.#parseImport()
          AriaLog.log('Found import operator')
          break
        }

        if (this.#buffer === AriaKeywords.export) {
          if (this.#ast.state.exports.length === 1) {
            throw AriaLog.ariaError(AriaException.oneExportOnly, this.#sourceLine())
          }

          this.#parseExport()
          AriaLog.log('Found export operator')
          break
        }
      }

      if (!this.#foundKeyword) {
        AriaLog.log('No valid identifier found', 'warn')
      }

      AriaLog.logNewline()

      this.#lineCursor++
    }

    return this.#ast
  }

  parseFile(templatePath: AriaTemplatePath, root?: string): AriaAst | undefined {
    if (typeof templatePath !== 'string') {
      throw AriaLog.ariaError(AriaException.noTemplate)
    }

    if (typeof root !== 'string') {
      root = process.cwd()
    }

    if (!this.#pathExists(templatePath)) {
      throw AriaLog.ariaError(AriaException.noTemplate)
    }

    try {
      AriaLog.text(`Resolved root directory: ${resolve(root)}`)
      AriaLog.text(`Resolved template: ${resolve(templatePath)}`)

      const metaPath: string = getMetaPath(templatePath) as string

      if (hasMeta(templatePath)) {
        AriaLog.text(`Resolved meta: ${resolve(metaPath)}`)
      } else {
        AriaLog.text(`Resolved meta: N/A`)
        AriaLog.newline()
        AriaLog.textWarning(
          `${chalk.dim(
            `meta file could not be resolved, if necessary, create a file named ${chalk.bold.white(
              parse(metaPath).base
            )} for extra customizability of the output filter file.`
          )}`
        )
      }

      AriaLog.newline()

      const template: string = readFileSync(templatePath, { encoding: 'utf-8' })

      this.parse(template)

      const meta: IAriaMeta | null = parseMeta(templatePath)

      if (meta != null) {
        this.#ast.meta = meta
      }

      this.#ast.root = root
      this.#ast.templatePath = templatePath

      return this.#ast
    } catch (e: any) {
      throw e
    }
  }
}

function handleUncaughtException(error: Error) {
  if (error instanceof AriaError) {
    AriaLog.textError(error.formatError())
  } else {
    AriaLog.textError(error)
  }

  process.exit(1)
}

process.on('uncaughtException', handleUncaughtException)
