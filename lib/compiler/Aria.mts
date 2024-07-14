import { NormalizedString } from '@igor.dvlpr/normalized-string'
import { u } from '@igor.dvlpr/upath'
import { accessSync, readFileSync } from 'node:fs'
import { isAbsolute, join, parse, resolve } from 'node:path'
import { AriaErrorString } from '../errors/AriaErrorString.mjs'
import { AriaAction } from '../models/AriaAction.mjs'
import { AriaInlineMeta } from '../models/AriaInlineMeta.mjs'
import { AriaNodeType } from '../models/AriaNodeType.mjs'
import type { AriaTemplatePath } from '../models/AriaTemplatePath.mjs'
import type { IAriaAction } from '../models/IAriaAction.mjs'
import type { IAriaMeta } from '../models/IAriaMeta.mjs'
import type { IAriaNode } from '../models/IAriaNode.mjs'
import type { IAriaOptions } from '../models/IAriaOptions.mjs'
import {
  type IAriaStatement,
  createAriaStatement
} from '../models/IAriaStatement.mjs'
import { AriaLog } from '../utils/AriaLog.mjs'
import {
  getMetaPath,
  hasMetaFile,
  parseExternalMeta
} from '../utils/AriaVarUtils.mjs'
import { AriaAst } from './AriaAst.mjs'
import {
  AriaKeywords,
  MINIMUM_IDENTIFIER_LENGTH,
  getMinimumKeywordIdentifier
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
      index: -1
    }

    if (typeof value === 'string') {
      node.value = value
    }

    if (Array.isArray(actions) && actions.length > 0) {
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

  #hasAction(actions: IAriaAction[], action: string): boolean {
    const actionsCount: number = actions.length

    if (actionsCount > 0) {
      for (let i = 0; i < actionsCount; i++) {
        if (actions[i].name === action) {
          return true
        }
      }
    }

    return false
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

          if (this.#hasAction(result, probeAction)) {
            AriaLog.warning(AriaErrorString.actionDuplicate, probeAction)
            AriaLog.newline()
            break
          }

          if (probeAction in AriaAction) {
            const action: IAriaAction = { ...AriaAction[probeAction] }

            this.#cursorInLine += probeAction.length + 1

            if (action.allowsParams) {
              let param: string = values[1]

              foundParam = true

              if (!param) {
                if (!action.defaultValue || action.defaultValue.length === 0) {
                  throw AriaLog.ariaThrow(
                    AriaErrorString.actionNoParam,
                    this.#sourceLine(),
                    action.name
                  )
                }

                param = action.defaultValue
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
                  throw AriaLog.ariaThrow(
                    AriaErrorString.actionInvalidParam,
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
            if (probeAction.length > 0) {
              throw AriaLog.ariaThrow(
                AriaErrorString.actionUnknownAction,
                this.#sourceLine(),
                probeAction
              )
            }

            AriaLog.warning(
              AriaErrorString.actionTrailingComma,
              this.#sourceLine()
            )
            AriaLog.newline()
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
        }

        throw AriaLog.ariaThrow(
          AriaErrorString.extraneousInput,
          this.#sourceLine(),
          result.value
        )
      }

      if (!shouldCapture) {
        if (this.#isWhitespace()) continue

        if (this.#char === "'") {
          shouldCapture = true
        } else {
          throw AriaLog.ariaThrow(
            AriaErrorString.expectedString,
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
      throw AriaLog.ariaThrow(
        AriaErrorString.unterminatedString,
        this.#sourceLine()
      )
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

  #parseImplement(): boolean {
    const statement: IAriaStatement = this.#parseString(true)
    const path: string = statement.value

    if (resolve(path) === resolve(this.#ast.templatePath)) {
      throw AriaLog.ariaThrow(
        AriaErrorString.recursiveImplement,
        this.#sourceLine()
      )
    }

    const oldLog: boolean = AriaLog.shouldLog

    AriaLog.shouldLog = false

    const instance: Aria = new Aria({ shouldLog: false })

    const parsed: AriaAst | undefined = instance.parseFile(
      path as AriaTemplatePath
    )

    AriaLog.shouldLog = oldLog

    if (parsed) {
      this.#ast.implementNodes(
        parsed.removeNodes([
          AriaNodeType.nodeExport,
          AriaNodeType.nodeHeader,
          AriaNodeType.nodeMeta
        ]),
        this.#sourceLine()
      )
    }

    this.#foundKeyword = true
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

      AriaLog.warning(AriaErrorString.includedAlready, path, this.#sourceLine())
      AriaLog.newline()
    }

    return true
  }

  #parseMeta(): boolean {
    const inlineMeta: string[] = this.#line.split('=')

    if (inlineMeta.length < 2) {
      throw AriaLog.ariaThrow(
        AriaErrorString.metaInvalidValue,
        this.#sourceLine()
      )
    }

    let metaProp: string = inlineMeta[0].replace(/^meta/i, '')
    const metaLength: number = metaProp.length

    metaProp = metaProp.trim()

    if (metaProp in AriaInlineMeta) {
      this.#cursorInLine += metaLength + 1

      const metaValue: IAriaStatement = this.#parseString()

      this.#ast.addNode(
        this.#node(AriaNodeType.nodeMeta, '', [
          { name: metaProp, allowsParams: true, actualValue: metaValue.value }
        ]),
        this.#sourceLine()
      )
    } else {
      throw AriaLog.ariaThrow(
        AriaErrorString.metaInvalidProp,
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

  // @ts-ignore
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
          throw AriaLog.ariaThrow(
            AriaErrorString.syntaxError,
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
    // this.#reset()
    this.#source = new NormalizedString(source).value

    const lines: string[] = this.#source.trimEnd().split(/\n/gm)
    const linesCount: number = lines.length
    const minimumIdentifier: string[] = getMinimumKeywordIdentifier()

    AriaLog.log(`Total lines: ${linesCount}`)
    AriaLog.log(`Versioning: ${this.#ast.versioning}`)

    AriaLog.logNewline()

    while (this.#lineCursor < linesCount) {
      if (!this.#shouldParse) {
        AriaLog.warning(AriaErrorString.unreachableNodes, this.#lineCursor)
        AriaLog.newline()
        break
      }

      let skipLine: boolean = false

      this.#line = lines[this.#lineCursor]
      this.#buffer = ''

      if (typeof this.#line !== 'string') break

      AriaLog.log(`Processing line: ${this.#sourceLine()}`)

      if (this.#line.trim().length === 0) {
        AriaLog.log('Blank line, skipping')
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
        if (skipLine) {
          break
        }

        if (
          this.#buffer.length === MINIMUM_IDENTIFIER_LENGTH &&
          !minimumIdentifier.includes(this.#buffer)
        ) {
          throw AriaLog.ariaThrow(
            AriaErrorString.syntaxError,
            this.#sourceLine(),
            this.#buffer
          )
        }

        if (this.#ast.state.exports.length === 1) {
          AriaLog.warning(AriaErrorString.unreachableNodes, this.#lineCursor)
          AriaLog.newline()

          this.#shouldParse = false
          break
        }

        this.#char = this.#line.charAt(this.#cursorInLine)

        if (this.#isWhitespace()) {
          continue
        }

        this.#buffer += this.#char

        switch (this.#buffer) {
          case AriaKeywords.headerImport: {
            this.#validateStatement()

            AriaLog.log(AriaErrorString.nodeLogHeader)
            AriaLog.logNewline()

            this.#parseHeaderImport()
            break
          }

          case AriaKeywords.meta: {
            this.#validateStatement()

            AriaLog.log(AriaErrorString.nodeLogMeta)
            AriaLog.logNewline()

            this.#parseMeta()

            if (this.#ast.getNodes(AriaNodeType.nodeMeta).length === 1) {
              AriaLog.info(
                'Detected inline meta, header and external metadata will be overridden.'
              )
              AriaLog.newline()
            }
            break
          }

          case AriaKeywords.include: {
            this.#validateStatement()

            AriaLog.log(AriaErrorString.nodeLogInclude)
            AriaLog.logNewline()

            this.#parseInclude()
            break
          }

          case AriaKeywords.import: {
            this.#validateStatement()

            AriaLog.log(AriaErrorString.nodeLogImport)
            AriaLog.logNewline()

            this.#parseInclude(true)
            break
          }

          case AriaKeywords.implement: {
            this.#validateStatement()

            if (this.#ast.state.hasImplement) {
              throw AriaLog.ariaThrow(
                AriaErrorString.oneImplementOnly,
                this.#sourceLine()
              )
            }

            AriaLog.log(AriaErrorString.nodeLogImplement)
            AriaLog.logNewline()

            this.#parseImplement()
            break
          }

          case AriaKeywords.newLine: {
            this.#validateStatement()

            this.#ast.addNode(
              this.#node(AriaNodeType.nodeNewLine),
              this.#sourceLine()
            )

            AriaLog.log(AriaErrorString.nodeLogNewline)
            AriaLog.logNewline()

            break
          }

          case AriaKeywords.commentInternal: {
            this.#foundKeyword = true
            AriaLog.log(AriaErrorString.nodeLogInternalComment)
            AriaLog.logNewline()
            skipLine = true
            break
          }

          case AriaKeywords.commentExported: {
            AriaLog.log(AriaErrorString.nodeLogExportedComment)
            AriaLog.logNewline()

            this.#parseComment()
            skipLine = true
            break
          }

          case AriaKeywords.tag: {
            this.#validateStatement()

            AriaLog.log(AriaErrorString.nodeLogTag)
            AriaLog.logNewline()

            this.#parseTag()
            break
          }

          case AriaKeywords.export: {
            this.#validateStatement()

            if (this.#ast.state.exports.length === 1) {
              throw AriaLog.ariaThrow(
                AriaErrorString.oneExportOnly,
                this.#sourceLine()
              )
            }

            AriaLog.log(AriaErrorString.nodeLogExport)
            AriaLog.logNewline()

            this.#parseExport()
            this.#shouldParse = false
            break
          }
        }
      }

      if (!this.#foundKeyword) {
        throw AriaLog.ariaThrow(
          AriaErrorString.syntaxError,
          this.#sourceLine(),
          this.#buffer
        )
      }

      this.#lineCursor++
    }

    return this.#ast
  }

  parseFile(
    templatePath: AriaTemplatePath,
    root?: string
  ): AriaAst | undefined {
    if (typeof templatePath !== 'string') {
      throw AriaLog.ariaThrow(AriaErrorString.noTemplate)
    }

    if (typeof root !== 'string') {
      root = process.cwd()
    } else {
      if (!isAbsolute(templatePath)) {
        templatePath = join(u(root), templatePath) as AriaTemplatePath
      }
    }

    if (!this.#pathExists(templatePath)) {
      throw AriaLog.ariaThrow(AriaErrorString.noTemplate)
    }

    try {
      templatePath = u(templatePath) as AriaTemplatePath
      AriaLog.log(AriaErrorString.resolvedRootDir, resolve(root))
      AriaLog.log(AriaErrorString.resolvedTemplate, resolve(templatePath))

      this.#ast.root = root
      this.#ast.templatePath = templatePath

      const metaPath: string = getMetaPath(templatePath) as string

      if (hasMetaFile(templatePath)) {
        AriaLog.log(AriaErrorString.resolvedMeta, resolve(metaPath))

        const meta: IAriaMeta | null = parseExternalMeta(templatePath)

        if (meta != null) {
          this.#ast.meta = meta
        }
      } else {
        AriaLog.log(AriaErrorString.resolvedMeta, 'N/A')
        AriaLog.newline()
        AriaLog.info(
          AriaErrorString.metaFileRecommendation,
          parse(metaPath).base
        )
        AriaLog.newline()
      }

      const template: string = readFileSync(templatePath, { encoding: 'utf-8' })

      this.parse(template)

      return this.#ast
    } catch (e: unknown) {
      // throw e
    }
  }
}
