import { AriaAst } from './AriaAst.mjs'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaOperators } from './AriaOperators.mjs'
import { AriaRules } from './AriaRules.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

export class Aria {
  #source: string
  #shouldLog: boolean

  #line: string
  #char: string
  #lineCursor: number
  #lineLength: number
  #cursorInLine: number
  // @ts-ignore
  #position: AriaSourcePosition

  constructor(source: string, shouldLog: boolean = false) {
    this.#source = source
    this.#line = ''
    this.#char = ''
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#lineLength = 0
    this.#position = this.#pos(-1, -1)
    this.#shouldLog ??= shouldLog
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): AriaNode {
    const position: AriaSourcePosition = this.#pos(this.#lineCursor, 1)

    const node: AriaNode = {
      type,
      position,
    }

    if (value) {
      node.value = value
    }

    if (flags) {
      node.flags = flags
    }

    return node
  }

  #pos(lineNumber: number, column: number): AriaSourcePosition {
    return {
      line: lineNumber,
      range: [0, column],
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

  #parseComment(): AriaNode {
    const comment: string = this.#chunk(1)
    return this.#node(AriaNodeType.nodeComment, comment)
  }

  #parseHeaderImport(): AriaNode {
    const path: string = this.#parsePath()
    console.log({ path })
    return this.#node(AriaNodeType.nodeHeader, path)
  }

  #parseImport(): AriaNode {
    const path: string = this.#parsePath()
    console.log({ path })
    return this.#node(AriaNodeType.nodeImport, path)
  }

  #parseExport(): AriaNode {
    const path: string = this.#parsePath()
    console.log({ path })
    const flags: string[] = []

    return this.#node(AriaNodeType.nodeExport, path[1], flags)
  }

  log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.#shouldLog) {
      console[logLevel](message)
    }
  }

  parse(): AriaAst {
    const ast: AriaAst = new AriaAst()

    const lines: string[] = this.#source.split(/\r?\n/gm)
    const linesCount: number = lines.length
    let done: boolean = false

    this.#lineCursor = 0

    while (this.#lineCursor < linesCount) {
      this.#line = lines[this.#lineCursor]
      this.#lineLength = this.#line.trim().length

      done = false

      this.log(`Processing line: ${this.#lineCursor}`)

      if (this.#lineLength === 0) {
        this.log(`Blank line: ${this.#lineCursor}, skipping...`)
        this.#lineCursor++
        continue
      }

      for (this.#cursorInLine = 0; this.#cursorInLine < this.#lineLength; this.#cursorInLine++) {
        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#char === ' ') {
          continue
        }

        if (this.#char === AriaOperators.comment) {
          if (this.#peek() === AriaOperators.comment) {
            this.log('Found exported comment...')
            ast.addNode(this.#parseComment())
            done = true
            break
          } else {
            this.log(`Found internal comment at char(${this.#cursorInLine}), skipping line...`)
          }
          done = true
          break
        }

        if (this.#char === AriaOperators.headerImport) {
          this.log('Found header import operator...')
          ast.addNode(this.#parseHeaderImport())
          done = true
          break
        }

        if (this.#char === AriaOperators.import) {
          this.log('Found import operator...')
          ast.addNode(this.#parseImport())
          done = true
          break
        }

        if (this.#char === AriaOperators.export) {
          // TODO: reimplement imports/exports counter
          this.log('Found export operator...')
          ast.addNode(this.#parseExport())
          done = true
          break
        }
      }

      this.#lineCursor++

      this.log()

      if (done) {
        continue
      }
    }

    return ast
  }
}
