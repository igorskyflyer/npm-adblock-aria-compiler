import { PathLike, writeFileSync } from 'fs'
import { join } from 'path'
import { AriaAst } from './AriaAst.mjs'
import { AriaNode } from './AriaNode.mjs'
import { AriaNodeType } from './AriaNodeType.mjs'
import { AriaOperators } from './AriaOperators.mjs'
import { AriaRules } from './AriaRules.mjs'
import { AriaSourcePosition } from './AriaSourcePosition.mjs'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

export class Aria {
  #source: string
  // @ts-ignore
  #line: string
  // @ts-ignore
  #char: string
  // @ts-ignore
  #position: AriaSourcePosition
  #shouldLog: boolean

  constructor(source: string, shouldLog: boolean = false) {
    this.#source = source
    this.#line = ''
    this.#char = ''
    this.#position = this.#pos(-1, -1)
    this.#shouldLog ??= shouldLog
  }

  #node(type: AriaNodeType, position: AriaSourcePosition, operand?: string, flags?: string[]): AriaNode {
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

  // TODO: implement seek()
  // #seek(count: number=1):boolean{}

  // TODO: implement peek()
  // #peek():boolean{return this.#seek()}

  #chunk(size: number): string
  #chunk(start: number, size: number): string
  #chunk(p1: number, p2?: number): string {
    return this.#source.substring(p2 ?? 0, p1)
  }

  #parseComment(line: string, i: number, j: number): AriaNode {
    const comment = line.substring(1)
    return this.#node(AriaNodeType.comment, this.#pos(i, j), comment)
  }

  #parseHeaderImport(line: string, i: number, j: number): AriaNode {
    const path = AriaRules.headerImport.exec(line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.header, this.#pos(i, j), path[1])
  }

  #parseImport(line: string, i: number, j: number): AriaNode {
    const path = AriaRules.import.exec(line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    return this.#node(AriaNodeType.import, this.#pos(i, j), path[1])
  }

  #parseExport(line: string, i: number, j: number): AriaNode {
    const path = AriaRules.export.exec(line)

    if (!path || path.length < 2) {
      this.log({ path })
      throw 'No path found'
    }

    const match = AriaRules.flagsExport.exec(line) || []

    this.log({ match })

    const flags = match.slice(1)

    return this.#node(AriaNodeType.export, this.#pos(i, j), path[1], flags)
  }

  log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.#shouldLog) {
      console[logLevel](message)
    }
  }

  parse(path?: PathLike): AriaAst {
    const ast: AriaAst = {
      nodesCount: 0,
      nodes: [],
    }

    const lines: string[] = this.#source.split(/\r?\n/gm)
    const linesCount: number = lines.length
    let i: number = 0
    let done: boolean = false

    while (i < linesCount) {
      const line: string = lines[i]
      const lineLength = line.length

      done = false

      this.log(`Processing line: ${i}`)

      if (lineLength === 0) {
        this.log(`Blank line: ${i}, skipping...`)
        i++
        continue
      }

      for (let j = 0; j < lineLength; j++) {
        const char: string = line.charAt(j)

        if (char === ' ') {
          continue
        }

        if (char === AriaOperators.comment) {
          if (line.charAt(j + 1) === AriaOperators.comment) {
            this.log('Found exported comment...')
            ast.nodes.push(this.#parseComment(line, i, lineLength - 1))
            ast.nodesCount++
            done = true
            break
          } else {
            this.log(`Found internal comment at char(${j}), skipping line...`)
          }
          done = true
          break
        }

        if (char === AriaOperators.headerImport) {
          this.log('Found header import operator...')
          ast.nodes.push(this.#parseHeaderImport(line, i, j))
          ast.nodesCount++
          done = true
          break
        }

        if (char === AriaOperators.import) {
          this.log('Found import operator...')
          ast.nodes.push(this.#parseImport(line, i, j))
          ast.nodesCount++
          done = true
          break
        }

        if (char === AriaOperators.export) {
          // TODO: reimplement imports/exports counter

          this.log('Found export operator...')
          ast.nodes.push(this.#parseExport(line, i, j))
          ast.nodesCount++
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

    if (path) {
      writeFileSync(join(path.toString(), 'ast.json'), JSON.stringify(ast))
    }

    return ast
  }
}
