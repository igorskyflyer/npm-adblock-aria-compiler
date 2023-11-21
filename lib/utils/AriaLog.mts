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
    const message: UnwrappedMessage = this.unwrapMessage(data, rest)
    console.log(message)
  }

  static warning(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, rest)

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_WARNING_BG).bold(' WARNING ')} ${chalk.dim(
        message
      )}`
    )
  }

  static info(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, rest)

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_INFORMATION_BG).bold(' INFO ')} ${chalk.dim(
        message
      )}`
    )
  }

  static error(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, rest)

    console.error(
      `${chalk.bgHex(ARIA_UI_BG_ERROR_BG).bold(' ERROR ')} ${message}`
    )
  }

  static success(data: MessageData, ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data, rest)

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

  static formatChanges(before: number, after: number): string {
    if (after <= 0) {
      return `${chalk.dim(AriaErrorString.logNoChanges.message)}`
    }

    if (before < 0) {
      return `(${chalk.greenBright(`+${after}`)})`
    }

    if (before < after) {
      return `(${chalk.greenBright(`+${after - before}`)})`
    } else if (before > after) {
      return `(${chalk.redBright(`-${before - after}`)})`
    } else {
      return `${chalk.dim(AriaErrorString.logNoChanges.message)}`
    }
  }
}
