import { NormalizedString } from '@igor.dvlpr/normalized-string'
import chalk from 'chalk'
import { PathLike, accessSync, readFileSync } from 'fs'
import { resolve } from 'node:path'
import { parse } from 'path'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaException } from '../errors/AriaException.mjs'
import { IAriaExceptionInfo } from '../errors/IAriaExceptionInfo.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { getMetaPath, hasMeta, parseMeta } from '../utils/AriaMetaUtils.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaOptions } from '../models/IAriaOptions.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { AriaAst } from './AriaAst.mjs'
import { AriaOperators } from './AriaOperators.mjs'

export class Aria {
  #source: string
  // global
  #line: string
  #char: string

  // per-line
  #lineCursor: number
  #lineLength: number
  #cursorInLine: number

  #ast: AriaAst

  constructor(options: IAriaOptions) {
    this.#source = ''
    this.#line = ''
    this.#char = ''
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0
    this.#ast = new AriaAst()
    this.#ast.versioning = options.versioning ?? 'auto'

    AriaLog.shouldLog = options.shouldLog ?? false
  }

  #ariaError(info: IAriaExceptionInfo, ...args: any[]): AriaError {
    return new AriaError(info, this.#lineCursor, args)
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): IAriaNode {
    const node: IAriaNode = {
      type,
      line: this.#lineCursor,
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

  #peek(count: number = 1): string {
    return this.#line.charAt(this.#cursorInLine + count)
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
        throw this.#ariaError(AriaException.extraneousInput, path)
      }

      if (!shouldCapture) {
        if (this.#isWhitespace()) continue
        if (this.#char === "'") {
          shouldCapture = true
        } else {
          throw this.#ariaError(AriaException.importPath, this.#char)
        }
      } else {
        if (this.#char === "'") {
          shouldCapture = false
          closedString = true
        } else {
          path += this.#char
        }
      }
    }

    if (!closedString) {
      throw this.#ariaError(AriaException.unterminatedPath)
    }

    return path
  }

  #parseComment(): boolean {
    const comment: string = this.#chunk(1)
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
    this.#ast.addNode(this.#node(AriaNodeType.nodeImport, path))

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

      if (typeof this.#line !== 'string') break

      this.#lineLength = this.#line.length

      AriaLog.log(`Processing line: ${this.#lineCursor}...`)

      if (this.#line.trim().length === 0) {
        AriaLog.log(`Blank line, skipping...`)
        AriaLog.newline()
        this.#lineCursor++
        continue
      }

      for (this.#cursorInLine = 0; this.#cursorInLine < this.#lineLength; this.#cursorInLine++) {
        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#isWhitespace()) {
          continue
        }

        if (this.#char === AriaOperators.newLine) {
          this.#ast.addNode(this.#node(AriaNodeType.nodeNewLine))
          AriaLog.log('Found an explicit new line...')
          AriaLog.newline()
          break
        }

        if (this.#char === AriaOperators.comment) {
          if (this.#peek() === AriaOperators.comment) {
            this.#parseComment()
            AriaLog.log('Found exported comment...')
            AriaLog.newline()
            break
          } else {
            AriaLog.log(`Found internal comment at char(${this.#cursorInLine}), skipping line...`)
            AriaLog.newline()
            break
          }
        }

        if (this.#char === AriaOperators.headerImport) {
          this.#parseHeaderImport()
          AriaLog.log('Found header import operator...')
          AriaLog.newline()
          break
        }

        if (this.#char === AriaOperators.import) {
          this.#parseImport()
          AriaLog.log('Found import operator...')
          AriaLog.newline()
          break
        }

        if (this.#char === AriaOperators.export) {
          if (this.#ast.state.exports === 1) {
            throw this.#ariaError(AriaException.oneExportOnly, this.#lineCursor)
          }

          this.#parseExport()
          AriaLog.log('Found export operator...')
          AriaLog.newline()
          break
        }
      }

      this.#lineCursor++
    }

    return this.#ast
  }

  parseFile(templatePath: AriaTemplatePath): AriaAst | undefined {
    if (typeof templatePath !== 'string') {
      throw this.#ariaError(AriaException.noTemplate)
    }

    if (!this.#pathExists(templatePath)) {
      throw this.#ariaError(AriaException.noTemplate)
    }

    try {
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

      const template: Buffer = readFileSync(templatePath)
      const contents: string = template.toString()

      this.parse(contents)

      const meta: IAriaMeta | null = parseMeta(templatePath)

      if (meta != null) {
        this.#ast.meta = meta
      }

      return this.#ast
    } catch (e: any) {
      if (e instanceof AriaError) {
        throw e
      } else {
        AriaLog.log(e)
        throw new AriaError({ id: '', message: '' }, 0, [1, 1])
      }
    }
  }
}

function handleUncaughtException(error: Error) {
  if (error instanceof AriaError) {
    console.error(error.formatError())
  } else {
    console.error(error)
  }

  process.exit(1)
}

process.on('uncaughtException', handleUncaughtException)
