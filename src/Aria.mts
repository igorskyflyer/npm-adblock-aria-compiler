import { readFileSync } from 'fs'
import { AriaAst } from './AriaAst.mjs'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaOperators } from './AriaOperators.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info'
type AriaTemplatePath = `${string}.adbt`

export class Aria {
  #source: string
  #shouldLog: boolean

  #line: string
  #char: string
  #lineCursor: number
  #lineLength: number
  #cursorInLine: number
  #position: AriaSourcePosition
  #ast: AriaAst

  constructor(shouldLog: boolean = false) {
    this.#shouldLog ??= shouldLog

    this.#source = ''
    this.#line = ''
    this.#char = ''
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0
    this.#position = this.#pos(-1, [-1, -1])
    this.#ast = new AriaAst()
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): AriaNode {
    const node: AriaNode = {
      type,
      position: this.#position,
    }

    if (value) {
      node.value = value
    }

    if (flags) {
      node.flags = flags
    }

    return node
  }

  #pos(lineNumber: number, range: [number, number]): AriaSourcePosition {
    return {
      line: lineNumber,
      range,
    }
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
        throw new Error(`Extraneous input found after the path.`)
      }

      if (!shouldCapture) {
        if (this.#char === ' ') continue
        if (this.#char === "'") {
          shouldCapture = true
        } else {
          throw new Error(`Expected a string path for import but found "${this.#char}..." at line: ${this.#position.line}.`)
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
      throw new Error(`Unclosed file path string.`)
    }

    return path
  }

  #parseComment(): boolean {
    const comment: string = this.#chunk(1)
    this.#position = this.#pos(this.#lineCursor, [1, comment.length - 1])
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
    this.#position = this.#pos(-1, [-1, -1])
    this.#ast = new AriaAst()
  }

  #log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.#shouldLog) {
      console[logLevel](message)
    }
  }

  get ast(): AriaAst {
    return this.#ast
  }

  parse(source: string): AriaAst {
    this.#reset()
    this.#source = source

    const lines: string[] = this.#source.split(/\r?\n/gm)
    const linesCount: number = lines.length

    while (this.#lineCursor < linesCount) {
      this.#line = lines[this.#lineCursor]
      this.#lineLength = this.#line.trim().length

      this.#position.line = this.#lineCursor

      this.#log(`Processing line: ${this.#lineCursor}...`)

      if (this.#lineLength === 0) {
        this.#log(`Blank line: ${this.#lineCursor}, skipping...`)
        this.#log()
        this.#lineCursor++
        continue
      }

      for (this.#cursorInLine = 0; this.#cursorInLine < this.#lineLength; this.#cursorInLine++) {
        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#char === ' ') {
          continue
        }

        if (this.#char === AriaOperators.newLine) {
          this.#log('Found an explicit new line...')
          this.#log()
          this.#ast.addNode(this.#node(AriaNodeType.nodeNewLine))
          break
        }

        if (this.#char === AriaOperators.comment) {
          if (this.#peek() === AriaOperators.comment) {
            this.#log('Found exported comment...')
            this.#log()
            this.#parseComment()
            break
          } else {
            this.#log(`Found internal comment at char(${this.#cursorInLine}), skipping line...`)
            this.#log()
            break
          }
        }

        if (this.#char === AriaOperators.headerImport) {
          this.#log('Found header import operator...')
          this.#log()
          this.#parseHeaderImport()
          break
        }

        if (this.#char === AriaOperators.import) {
          this.#log('Found import operator...')
          this.#log()
          this.#parseImport()
          break
        }

        if (this.#char === AriaOperators.export) {
          if (this.#ast.state.exports === 1) {
            throw new Error('Only 1 export can exist per template!')
          }

          this.#log('Found export operator...')
          this.#log()
          this.#parseExport()
          break
        }
      }

      this.#lineCursor++
    }

    return this.#ast
  }

  parseFile(templatePath: AriaTemplatePath): AriaAst {
    if (typeof templatePath !== 'string') {
      throw new Error('No valid templated path provided.')
    }

    try {
      const template: Buffer = readFileSync(templatePath)
      const contents: string = template.toString()
      return this.parse(contents)
    } catch (e) {
      throw e
    }
  }
}
