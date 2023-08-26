import { NormalizedString } from '@igor.dvlpr/normalized-string'
import chalk from 'chalk'
import { PathLike, accessSync, readFileSync } from 'fs'
import { resolve } from 'node:path'
import { isAbsolute, join, parse } from 'path'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaString } from '../errors/AriaString.mjs'
import { AriaAction } from '../models/AriaAction.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import { IAriaAction } from '../models/IAriaAction.mjs'
import { IAriaMeta } from '../models/IAriaMeta.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'
import { IAriaOptions } from '../models/IAriaOptions.mjs'
import {
  IAriaStatement,
  createAriaStatement,
} from '../models/IAriaStatement.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import { getMetaPath, hasMeta, parseMeta } from '../utils/AriaVarUtils.mjs'
import { AriaAst } from './AriaAst.mjs'
import { AriaKeywords, getLongestKeyword } from './AriaKeywords.mjs'

export class Aria {
  #source: string
  // global
  #line: string
  #char: string
  #shouldParse: boolean

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
    this.#shouldParse = true

    AriaLog.shouldLog = options.shouldLog ?? false
  }

  #sourceLine(): number {
    return this.#lineCursor + 1
  }

  #node(
    type: AriaNodeType,
    value?: string,
    actions?: IAriaAction[]
  ): IAriaNode {
    this.#foundKeyword = true

    const node: IAriaNode = {
      type,
      line: this.#sourceLine(),
    }

    if (typeof value === 'string') {
      node.value = value
    }

    if (actions instanceof Array && actions.length > 0) {
      node.actions = actions
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

  #parseActions(input: string): IAriaAction[] {
    const actions: IAriaAction[] = []

    if (typeof input !== 'string') {
      return actions
    }

    input = input.trim()

    const count: number = input.length

    if (count === 0) {
      return actions
    }

    const values: string[] = input.split('=')

    if (values.length === 0) {
      return actions
    } else {
      const probeAction: string = values[0].trim()

      if (probeAction in AriaAction) {
        const action: IAriaAction = AriaAction[probeAction]

        this.#cursorInLine += probeAction.length + 1

        if (action.allowsParams) {
          let param: string = values[1]

          if (!param) {
            if (!action.defaultValue || action.defaultValue.length === 0) {
              throw AriaLog.ariaError(
                AriaString.actionNoParam,
                this.#sourceLine(),
                action.name
              )
            } else {
              param = action.defaultValue
            }
          } else {
            param = param.trim()
          }

          if (action.paramValues) {
            // user provided value
            if (action.paramValues[0] === '*') {
              action.actualValue = this.parseString(true).value
            } else if (action.paramValues.indexOf(param) > -1) {
              // only allowed values
              action.actualValue = param
            } else {
              // unknown value
              throw AriaLog.ariaError(
                AriaString.actionInvalidParam,
                this.#sourceLine(),
                action.name,
                action.paramValues.toString()
              )
            }
          }
        }

        actions.push(action)
      } else {
        throw AriaLog.ariaError(
          AriaString.actionUnknownAction,
          this.#sourceLine()
        )
      }
    }

    return actions
  }

  parseString(allowActions: boolean = false): IAriaStatement {
    const result: IAriaStatement = createAriaStatement()
    let shouldCapture: boolean = false
    let closedString: boolean = false

    while (this.#read()) {
      if (closedString) {
        if (allowActions) {
          break
        } else {
          throw AriaLog.ariaError(
            AriaString.extraneousInput,
            this.#sourceLine(),
            result.value
          )
        }
      }

      if (!shouldCapture) {
        if (this.#isWhitespace()) continue
        if (this.#char === "'") {
          shouldCapture = true
        } else {
          throw AriaLog.ariaError(
            AriaString.includePath,
            this.#sourceLine(),
            this.#char
          )
        }
      } else {
        if (this.#char === '\\') {
          this.#read()
          result.value += this.#char
          continue
        }

        if (this.#char === "'") {
          shouldCapture = false
          closedString = true
        } else {
          result.value += this.#char
        }
      }
    }

    if (!closedString) {
      throw AriaLog.ariaError(AriaString.unterminatedString, this.#sourceLine())
    }

    return result
  }

  #parseComment(): boolean {
    const comment: string = this.#chunk(1).trim()
    this.#ast.addNode(
      this.#node(AriaNodeType.nodeComment, comment),
      this.#sourceLine()
    )

    return true
  }

  #parseTag(): boolean {
    let tagDescription: string = ''

    if (this.#line.trim().length > 3) {
      tagDescription = this.parseString().value
    }

    this.#ast.addNode(
      this.#node(AriaNodeType.nodeTag, tagDescription),
      this.#sourceLine()
    )

    return true
  }

  #parseHeaderImport(): boolean {
    const path: string = this.parseString().value
    this.#ast.addNode(
      this.#node(AriaNodeType.nodeHeader, path),
      this.#sourceLine()
    )

    return true
  }

  #parseInclude(isImport: boolean = false): boolean {
    const statement: IAriaStatement = this.parseString(true)
    const path: string = statement.value

    statement.actions = this.#parseActions(this.#chunk(this.#cursorInLine + 1))

    if (!this.#ast.state.imports.includes(path)) {
      if (isImport) {
        this.#ast.addNode(
          this.#node(AriaNodeType.nodeImport, path, statement.actions),
          this.#sourceLine()
        )
      } else {
        this.#ast.addNode(
          this.#node(AriaNodeType.nodeInclude, path, statement.actions),
          this.#sourceLine()
        )
      }
    } else {
      this.#foundKeyword = true

      AriaLog.textWarning(AriaString.includedAlready.message, path)
      AriaLog.newline()
    }

    return true
  }

  #parseExport(): boolean {
    const statement: IAriaStatement = this.parseString(true)
    const path: string = statement.value

    this.#ast.addNode(
      this.#node(AriaNodeType.nodeExport, path, []),
      this.#sourceLine()
    )

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
    this.#shouldParse = true

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

    const lines: string[] = this.#source.trimEnd().split(/\n/gm)
    const linesCount: number = lines.length
    const longestKeyword: number = getLongestKeyword().length

    AriaLog.log(`Total lines: ${linesCount}`)
    AriaLog.log(`Versioning: ${this.#ast.versioning}`)

    AriaLog.newline()

    while (this.#lineCursor < linesCount) {
      if (!this.#shouldParse) {
        AriaLog.textWarning(
          AriaString.unreachableNodes.message,
          this.#lineCursor
        )
        AriaLog.newline()
        break
      }

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

      for (
        this.#cursorInLine = 0;
        this.#cursorInLine < this.#lineLength;
        this.#cursorInLine++
      ) {
        const bufferLength: number = this.#buffer.length

        if (bufferLength > longestKeyword) {
          throw AriaLog.ariaError(AriaString.syntaxError, this.#sourceLine())
        }

        if (this.#ast.state.exports.length === 1) {
          AriaLog.textWarning(
            AriaString.unreachableNodes.message,
            this.#lineCursor
          )
          AriaLog.newline()

          this.#shouldParse = false
          break
        }

        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#isWhitespace()) {
          continue
        }

        this.#buffer += this.#char

        if (this.#buffer === AriaKeywords.newLine) {
          this.#ast.addNode(
            this.#node(AriaNodeType.nodeNewLine),
            this.#sourceLine()
          )
          AriaLog.log('Found an explicit new line')
          break
        }

        if (this.#buffer === AriaKeywords.commentInternal) {
          this.#foundKeyword = true
          AriaLog.log(`Found an internal comment, skipping line`)
          break
        }

        if (this.#buffer === AriaKeywords.commentExported) {
          this.#parseComment()
          AriaLog.log('Found an exported comment')
          break
        }

        if (this.#buffer === AriaKeywords.tag) {
          this.#parseTag()
          AriaLog.log('Found a tag')
          break
        }

        if (this.#buffer === AriaKeywords.headerImport) {
          this.#parseHeaderImport()
          AriaLog.log('Found a header import')
          break
        }

        if (this.#buffer === AriaKeywords.include) {
          this.#parseInclude()
          AriaLog.log('Found an include')
          break
        }

        if (this.#buffer === AriaKeywords.import) {
          this.#parseInclude(true)
          AriaLog.log('Found an import')
          break
        }

        if (this.#buffer === AriaKeywords.export) {
          if (this.#ast.state.exports.length === 1) {
            throw AriaLog.ariaError(
              AriaString.oneExportOnly,
              this.#sourceLine()
            )
          }

          this.#parseExport()
          AriaLog.log('Found an export operator')
          this.#shouldParse = false
          break
        }
      }

      if (!this.#foundKeyword) {
        throw AriaLog.ariaError(AriaString.syntaxError, this.#sourceLine())
      }

      AriaLog.logNewline()

      this.#lineCursor++
    }

    return this.#ast
  }

  parseFile(
    templatePath: AriaTemplatePath,
    root?: string
  ): AriaAst | undefined {
    if (typeof templatePath !== 'string') {
      throw AriaLog.ariaError(AriaString.noTemplate)
    }

    if (typeof root !== 'string') {
      root = process.cwd()
    } else {
      if (!isAbsolute(templatePath)) {
        templatePath = join(root, templatePath) as AriaTemplatePath
      }
    }

    if (!this.#pathExists(templatePath)) {
      throw AriaLog.ariaError(AriaString.noTemplate)
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
