import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { u } from '@igor.dvlpr/upath'
import chalk from 'chalk'
import { accessSync, readFileSync } from 'fs'
import { resolve } from 'node:path'
import { isAbsolute, join, parse } from 'path'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaString } from '../errors/AriaString.mjs'
import { AriaAction } from '../models/AriaAction.mjs'
import { AriaInlineMeta } from '../models/AriaInlineMeta.mjs'
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
import {
  getMetaPath,
  hasMetaFile,
  parseExternalMeta,
} from '../utils/AriaVarUtils.mjs'
import { AriaAst } from './AriaAst.mjs'
import {
  AriaKeywords,
  MINIMUM_IDENTIFIER_LENGTH,
  getMinimumKeywordIdentifier,
} from './AriaKeywords.mjs'

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
    const result: IAriaAction[] = []

    if (typeof input !== 'string') {
      return result
    }

    input = input.trim()

    const count: number = input.length

    if (count === 0) {
      return result
    }

    const actions: string[] = input.split(',')
    const actionsCount = actions.length

    // multiple actions
    if (actionsCount > 0) {
      for (let i = 0; i < actionsCount; i++) {
        const values: string[] = actions[i].split('=')
        const valuesCount: number = values.length
        let foundParam: boolean = false

        for (let j = 0; j < valuesCount; j++) {
          if (foundParam) {
            break
          }

          const probeAction: string = values[j].trim()

          if (probeAction in AriaAction) {
            const action: IAriaAction = AriaAction[probeAction]

            this.#cursorInLine += probeAction.length + 1

            if (action.allowsParams) {
              let param: string = values[1]

              foundParam = true

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
                  action.actualValue = this.#parseString(true).value
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

              result.push(action)
            } else {
              result.push(action)
            }
          } else {
            throw AriaLog.ariaError(
              AriaString.actionUnknownAction,
              this.#sourceLine()
            )
          }
        }
      }
    }

    return result
  }

  #parseString(allowActions: boolean = false): IAriaStatement {
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
            AriaString.expectedString,
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
      tagDescription = this.#parseString().value
    }

    this.#ast.addNode(
      this.#node(AriaNodeType.nodeTag, tagDescription),
      this.#sourceLine()
    )

    return true
  }

  #parseHeaderImport(): boolean {
    const path: string = this.#parseString().value
    this.#ast.addNode(
      this.#node(AriaNodeType.nodeHeader, path),
      this.#sourceLine()
    )

    return true
  }

  #parseInclude(isImport: boolean = false): boolean {
    const statement: IAriaStatement = this.#parseString(true)
    const path: string = statement.value

    if (!this.#ast.state.imports.includes(path)) {
      statement.actions = this.#parseActions(
        this.#chunk(this.#cursorInLine + 1)
      )

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

      AriaLog.textWarning(
        AriaString.includedAlready.message,
        path,
        this.#sourceLine()
      )
      AriaLog.newline()
    }

    return true
  }

  #parseMeta(): boolean {
    const inlineMeta: string[] = this.#line.split('=')

    if (inlineMeta.length < 2) {
      throw AriaLog.ariaError(AriaString.metaInvalidValue, this.#sourceLine())
    }

    let metaProp: string = inlineMeta[0].replace(/^meta/i, '')
    const metaLength: number = metaProp.length

    metaProp = metaProp.trim()

    if (metaProp in AriaInlineMeta) {
      this.#cursorInLine += metaLength + 1

      const metaValue: IAriaStatement = this.#parseString()

      this.#ast.addNode(
        this.#node(AriaNodeType.nodeMeta, '', [
          { name: metaProp, allowsParams: true, actualValue: metaValue.value },
        ]),
        this.#sourceLine()
      )
    } else {
      throw AriaLog.ariaError(
        AriaString.metaInvalidProp,
        this.#sourceLine(),
        metaProp
      )
    }

    return true
  }

  #parseExport(): boolean {
    const statement: IAriaStatement = this.#parseString(true)
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

  #pathExists(path: string): boolean {
    try {
      accessSync(u(path))
      return true
    } catch {}
    return false
  }

  #validateStatement(): void {
    let cursor: number = this.#cursorInLine + 1
    let char: string | undefined = this.#line.at(cursor)

    if (!char) {
      return
    }

    let buffer: string = ''

    while (cursor < this.#lineLength) {
      if (char === ' ' || char === '\t') {
        if (buffer.length > 0) {
          throw AriaLog.ariaError(
            AriaString.syntaxError,
            this.#sourceLine(),
            `${this.#buffer}${buffer}`
          )
        }

        break
      }

      buffer += char
      cursor++
      char = this.#line.at(cursor)
    }
  }

  get ast(): AriaAst {
    return this.#ast
  }

  parse(source: string): AriaAst {
    this.#reset()
    this.#source = new NormalizedString(source).value

    const lines: string[] = this.#source.trimEnd().split(/\n/gm)
    const linesCount: number = lines.length
    const minimumIdentifier: string[] = getMinimumKeywordIdentifier()

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
        if (
          this.#buffer.length === MINIMUM_IDENTIFIER_LENGTH &&
          !minimumIdentifier.includes(this.#buffer)
        ) {
          throw AriaLog.ariaError(
            AriaString.syntaxError,
            this.#sourceLine(),
            this.#buffer
          )
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

        if (this.#buffer === AriaKeywords.headerImport) {
          this.#validateStatement()
          AriaLog.log(AriaString.nodeLogHeader.message)
          this.#parseHeaderImport()
          break
        }

        if (this.#buffer === AriaKeywords.meta) {
          this.#validateStatement()

          AriaLog.log(AriaString.nodeLogMeta.message)
          this.#parseMeta()

          if (this.#ast.getNodes(AriaNodeType.nodeMeta).length === 1) {
            AriaLog.textInfo(
              `Detected inline meta, header and external metadata will be overridden.`
            )
            AriaLog.newline()
          }
          break
        }

        if (this.#buffer === AriaKeywords.include) {
          this.#validateStatement()

          AriaLog.log(AriaString.nodeLogInclude.message)
          this.#parseInclude()
          break
        }

        if (this.#buffer === AriaKeywords.import) {
          this.#validateStatement()

          AriaLog.log(AriaString.nodeLogImport.message)
          this.#parseInclude(true)
          break
        }

        if (this.#buffer === AriaKeywords.newLine) {
          this.#validateStatement()

          this.#ast.addNode(
            this.#node(AriaNodeType.nodeNewLine),
            this.#sourceLine()
          )
          AriaLog.log(AriaString.nodeLogNewline.message)
          break
        }

        if (this.#buffer === AriaKeywords.commentInternal) {
          this.#foundKeyword = true
          AriaLog.log(AriaString.nodeLogInternalComment.message)
          break
        }

        if (this.#buffer === AriaKeywords.commentExported) {
          AriaLog.log(AriaString.nodeLogExportedComment.message)
          this.#parseComment()
          break
        }

        if (this.#buffer === AriaKeywords.tag) {
          this.#validateStatement()

          AriaLog.log(AriaString.nodeLogTag.message)
          this.#parseTag()
          break
        }

        if (this.#buffer === AriaKeywords.export) {
          this.#validateStatement()

          if (this.#ast.state.exports.length === 1) {
            throw AriaLog.ariaError(
              AriaString.oneExportOnly,
              this.#sourceLine()
            )
          }

          AriaLog.log(AriaString.nodeLogExport.message)
          this.#parseExport()
          this.#shouldParse = false
          break
        }
      }

      if (!this.#foundKeyword) {
        throw AriaLog.ariaError(
          AriaString.syntaxError,
          this.#sourceLine(),
          this.#buffer
        )
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
        templatePath = join(u(root), templatePath) as AriaTemplatePath
      }
    }

    if (!this.#pathExists(templatePath)) {
      throw AriaLog.ariaError(AriaString.noTemplate)
    }

    try {
      templatePath = u(templatePath) as AriaTemplatePath
      AriaLog.text(`Resolved root directory: ${resolve(root)}`)
      AriaLog.text(`Resolved template: ${resolve(templatePath)}`)

      const metaPath: string = getMetaPath(templatePath) as string

      if (hasMetaFile(templatePath)) {
        AriaLog.text(`Resolved external meta: ${resolve(metaPath)}`)
      } else {
        AriaLog.text(`Resolved external meta: N/A`)
        AriaLog.newline()
        AriaLog.textInfo(
          `${chalk.dim(
            `meta file could not be resolved, if necessary, create a file named ${chalk.bold.white(
              parse(metaPath).base
            )} for extra customizability of the output filter file.`
          )}`
        )
      }

      const template: string = readFileSync(templatePath, { encoding: 'utf-8' })

      this.parse(template)

      const meta: IAriaMeta | null = parseExternalMeta(templatePath)

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
