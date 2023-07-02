import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { readFileSync } from 'fs'
import { AriaAst } from './AriaAst.mjs'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaOperators } from './AriaOperators.mjs'
import { IAriaOptions } from './IAriaOptions.mjs'
import { AriaError } from './errors/AriaError.mjs'
import { AriaException } from './errors/AriaException.mjs'
import { AriaExceptionInfo } from './errors/AriaExceptionInfo.mjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info'
type AriaTemplatePath = `${string}.adbt`

export class Aria {
  #source: string
  #shouldLog: boolean

  // global
  #line: string
  #char: string

  // per-line
  #lineCursor: number
  #lineLength: number
  #cursorInLine: number

  #ast: AriaAst

  constructor(options: IAriaOptions) {
    this.#shouldLog = options.shouldLog ?? false

    this.#source = ''
    this.#line = ''
    this.#char = ''
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0
    this.#ast = new AriaAst()
    this.#ast.headerVersion = options.versioning ?? 'semver'
  }

  #ariaError(info: AriaExceptionInfo, ...args: any[]): AriaError {
    return new AriaError(info, this.#lineCursor, args)
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): AriaNode {
    const node: AriaNode = {
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

    const oldHeaderVersion = this.#ast.headerVersion
    this.#ast = new AriaAst()
    this.#ast.headerVersion = oldHeaderVersion
  }

  #log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.#shouldLog) {
      console[logLevel](message)
    }
  }

  #isWhitespace(): boolean {
    return this.#char === ' ' || this.#char === '\t'
  }

  get ast(): AriaAst {
    return this.#ast
  }

  parse(source: string): AriaAst {
    this.#reset()
    this.#source = new NormalizedString(source).value

    const lines: string[] = this.#source.split(/\n/gm)
    const linesCount: number = lines.length

    this.#log(`Total lines: ${linesCount}`)
    this.#log(`Header version: ${this.#ast.headerVersion}`)
    this.#log()

    while (this.#lineCursor < linesCount) {
      this.#line = lines[this.#lineCursor]

      if (typeof this.#line !== 'string') break

      this.#lineLength = this.#line.length

      this.#log(`Processing line: ${this.#lineCursor}...`)

      if (this.#line.trim().length === 0) {
        this.#log(`Blank line: ${this.#lineCursor}, skipping...`)
        this.#log()
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
          this.#log('Found an explicit new line...')
          this.#log()
          break
        }

        if (this.#char === AriaOperators.comment) {
          if (this.#peek() === AriaOperators.comment) {
            this.#parseComment()
            this.#log('Found exported comment...')
            this.#log()
            break
          } else {
            this.#log(`Found internal comment at char(${this.#cursorInLine}), skipping line...`)
            this.#log()
            break
          }
        }

        if (this.#char === AriaOperators.headerImport) {
          this.#parseHeaderImport()
          this.#log('Found header import operator...')
          this.#log()
          break
        }

        if (this.#char === AriaOperators.import) {
          this.#parseImport()
          this.#log('Found import operator...')
          this.#log()
          break
        }

        if (this.#char === AriaOperators.export) {
          if (this.#ast.state.exports === 1) {
            throw this.#ariaError(AriaException.oneExportOnly, this.#lineCursor)
          }

          this.#parseExport()
          this.#log('Found export operator...')
          this.#log()
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

    try {
      const template: Buffer = readFileSync(templatePath)
      const contents: string = template.toString()
      return this.parse(contents)
    } catch (e: any) {
      if (e instanceof AriaError) {
        throw e
      } else {
        console.log(e)
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
