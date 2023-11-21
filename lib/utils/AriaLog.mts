import { zing } from '@igor.dvlpr/zing'
import chalk from 'chalk'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaString, AriaStringType } from '../errors/AriaString.mjs'
import { IAriaMessageData } from '../errors/IAriaMessageData.mjs'
import {
  ARIA_UI_BG_ERROR_BG,
  ARIA_UI_BG_INFORMATION_BG,
  ARIA_UI_BG_SUCCESS_BG,
  ARIA_UI_BG_WARNING_BG
} from './AriaUi.mjs'

type InternalMessage = AriaStringType | string
type UnwrappedMessage = string | null

export class AriaLog {
  static shouldLog: boolean = false

  private static unwrapMessage(data: InternalMessage): UnwrappedMessage {
    if (typeof data === 'string') {
      return data
    } else if ('message' in data) {
      return data.message
    } else {
      return null
    }
  }

  static log(message: any = '', ...rest: any[]): void {
    if (this.shouldLog) {
      console.log(zing(message, ...rest))
    }
  }

  static text(data: InternalMessage = '', ...rest: any[]): void {
    const message: UnwrappedMessage = this.unwrapMessage(data)

    if (message !== null) {
      console.log(zing(message, ...rest))
    } else {
      console.log(data)
    }
  }

  static warning(data: InternalMessage, ...rest: any[]): void {
    let message: UnwrappedMessage = this.unwrapMessage(data)

    if (message !== null) {
      message = zing(message, ...rest)
    } else {
      message = data as string
    }

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_WARNING_BG).bold(' WARNING ')} ${chalk.dim(
        message
      )}`
    )
  }

  static info(data: InternalMessage, ...rest: any[]): void {
    let message: UnwrappedMessage = this.unwrapMessage(data)

    if (message !== null) {
      message = zing(message, ...rest)
    } else {
      message = data as string
    }

    console.warn(
      `${chalk.bgHex(ARIA_UI_BG_INFORMATION_BG).bold(' INFO ')} ${chalk.dim(
        message
      )}`
    )
  }

  static textError(message: any): void {
    console.error(
      `${chalk.bgHex(ARIA_UI_BG_ERROR_BG).bold(' ERROR ')} ${message}`
    )
  }

  static textSuccess(message: any): void {
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
    AriaLog.textError(new AriaError(info, lineCursor, ...args).formatError())
    process.exit(1)
  }

  static formatChanges(before: number, after: number): string {
    if (after <= 0) {
      return `${chalk.dim(AriaString.logNoChanges.message)}`
    }

    if (before < 0) {
      return `(${chalk.greenBright(`+${after}`)})`
    }

    if (before < after) {
      return `(${chalk.greenBright(`+${after - before}`)})`
    } else if (before > after) {
      return `(${chalk.redBright(`-${before - after}`)})`
    } else {
      return `${chalk.dim(AriaString.logNoChanges.message)}`
    }
  }
}
