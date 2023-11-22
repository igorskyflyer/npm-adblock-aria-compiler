import { zing } from '@igor.dvlpr/zing'
import chalk from 'chalk'
import {
  ARIA_UI_BG_ERROR_BG,
  ARIA_UI_BG_INFORMATION_BG,
  ARIA_UI_BG_SUCCESS_BG,
  ARIA_UI_BG_WARNING_BG
} from '../constants/AriaUi.mjs'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaErrorString } from '../errors/AriaErrorString.mjs'
import { IAriaMessageData } from '../errors/IAriaMessageData.mjs'
import { IAriaNode } from '../models/IAriaNode.mjs'

type MessageData = IAriaMessageData | string | Array<IAriaNode>
type UnwrappedMessage = string | Array<any>

export class AriaLog {
  static shouldLog: boolean = false

  private static unwrapMessage(
    data: MessageData,
    ...rest: any[]
  ): UnwrappedMessage {
    if (typeof data === 'string') {
      return data
    } else if ('message' in data) {
      return zing(data.message, ...rest)
    } else {
      return data
    }
  }

  static log(data: MessageData = '', ...rest: any[]): void {
    if (this.shouldLog) {
      this.text(data, rest)
    }
  }

  static text(data: MessageData = '', ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, ...rest)
    console.log(message)
  }

  static warning(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, ...rest)

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_WARNING_BG).bold(' WARNING ')} ${chalk.dim(
        message
      )}`
    )
  }

  static info(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, ...rest)

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_INFORMATION_BG).bold(' INFO ')} ${chalk.dim(
        message
      )}`
    )
  }

  static error(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, ...rest)

    console.error(
      `${chalk.bgHex(ARIA_UI_BG_ERROR_BG).bold(' ERROR ')} ${message}`
    )
  }

  static success(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, ...rest)

    console.log(
      `${chalk.bgHex(ARIA_UI_BG_SUCCESS_BG).bold(' SUCCESS ')} ${message}`
    )
  }

  static newline(): void {
    console.log()
  }

  static logNewline(): void {
    this.log()
  }

  static ariaThrow(
    info: IAriaMessageData,
    lineCursor: number = -1,
    ...args: any[]
  ): AriaError {
    this.error(new AriaError(info, lineCursor, ...args).formatError())
    process.exit(1)
  }

  static diffToString(
    before: number,
    after: number,
    label: string = '',
    addSeparator: boolean = false
  ): string {
    const diff = after - before
    let output: string = ''

    switch (true) {
      case diff > 0: {
        output += `${chalk.greenBright(`+${diff}`)} ${chalk.dim(label)}`
        break
      }

      case diff < 0: {
        output += `${chalk.redBright(`${diff}`)} ${chalk.dim(label)}`
        break
      }

      default: {
        return output
      }
    }

    if (addSeparator) {
      output += chalk.dim('; ')
    }

    return output
  }

  static formatChanges(
    before: number,
    after: number,
    oldLength: number,
    newLength: number
  ): string {
    let output: string = chalk.dim('(')
    let entries: string = ''
    let characters: string = ''

    entries += this.diffToString(before, after, 'entries', true)
    characters += this.diffToString(oldLength, newLength, 'characters')

    if (entries === '' && characters === '') {
      output += chalk.dim(AriaErrorString.logNoChanges.message)
    } else if (entries === '' && characters !== '') {
      output += `${chalk.dim('no changes;')} ${characters}`
    } else {
      output += entries + characters
    }

    output += chalk.dim(')')

    return output
  }
}
