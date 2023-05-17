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
  #cursorInLine: number
  #position: AriaSourcePosition

  constructor(source: string, shouldLog: boolean = false) {
    this.#source = source
    this.#line = ''
    this.#char = ''
    this.#cursorInLine = 0
    this.#lineCursor = 0
    this.#position = this.#pos(-1, -1)
    this.#shouldLog ??= shouldLog
  }

  #node(type: AriaNodeType, value?: string, flags?: string[]): AriaNode {
    const position = this.#position

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

  // @ts-ignore
  #seek(count: number = 1): boolean {
    this.#cursorInLine += count
    return true
  }

  #peek(count: number = 1): string {
    return this.#line.charAt(this.#cursorInLine + count)
  }

  #chunk(start: number, end?: number): string {
    return this.#line.substring(start, end)
  }

  #parseComment(): AriaNode {
    const comment = this.#chunk(1)
    return this.#node(AriaNodeType.nodeComment, comment)
  }

  #parseHeaderImport(): AriaNode {
    const path = AriaRules.headerImport.exec(this.#line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.nodeHeader, path[1])
  }

  #parseImport(): AriaNode {
    const path = AriaRules.import.exec(this.#line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.nodeImport, path[1])
  }

  #parseExport(): AriaNode {
    const path = AriaRules.export.exec(this.#line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    const match = AriaRules.flagsExport.exec(this.#line) || []

    this.log({ match })

    const flags = match.slice(1)

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
      const lineLength = this.#line.trim().length

      done = false

      this.log(`Processing line: ${this.#lineCursor}`)

      if (lineLength === 0) {
        this.log(`Blank line: ${this.#lineCursor}, skipping...`)
        this.#lineCursor++
        continue
      }

      for (this.#cursorInLine = 0; this.#cursorInLine < lineLength; this.#cursorInLine++) {
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
