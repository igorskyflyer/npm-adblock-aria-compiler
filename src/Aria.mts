import { AriaAst } from './AriaAst.mjs'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaOperators } from './AriaOperators.mjs'
import { AriaRules } from './AriaRules.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

export class Aria {
  #source: string
  #line: string
  #char: string
  #cursor: number
  #position: AriaSourcePosition
  #shouldLog: boolean

  constructor(source: string, shouldLog: boolean = false) {
    this.#source = source
    this.#line = ''
    this.#char = ''
    this.#cursor = 0
    this.#position = this.#pos(-1, -1)
    this.#shouldLog ??= shouldLog
  }

  #node(type: AriaNodeType, operand?: string, flags?: string[]): AriaNode {
    const position = this.#position

    const node: AriaNode = {
      type,
      position,
    }

    if (operand) {
      node.operand = operand
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
    this.#cursor += count
    return true
  }

  #peek(count: number = 1): string {
    return this.#line.charAt(this.#cursor + count)
  }

  #chunk(start: number, end?: number): string {
    return this.#line.substring(start, end)
  }

  #parseComment(): AriaNode {
    const comment = this.#chunk(1)
    return this.#node(AriaNodeType.comment, comment)
  }

  #parseHeaderImport(): AriaNode {
    const path = AriaRules.headerImport.exec(this.#line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.header, path[1])
  }

  #parseImport(): AriaNode {
    const path = AriaRules.import.exec(this.#line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.import, path[1])
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

    return this.#node(AriaNodeType.export, path[1], flags)
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
    let i: number = 0
    let done: boolean = false

    while (i < linesCount) {
      this.#line = lines[i]
      const lineLength = this.#line.trim().length

      done = false

      this.log(`Processing line: ${i}`)

      if (lineLength === 0) {
        this.log(`Blank line: ${i}, skipping...`)
        i++
        continue
      }

      for (this.#cursor = 0; this.#cursor < lineLength; this.#cursor++) {
        this.#char = this.#line.charAt(this.#cursor)

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
            this.log(`Found internal comment at char(${this.#cursor}), skipping line...`)
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

      i++

      this.log()

      if (done) {
        continue
      }
    }

    return ast
  }
}
