import { zing } from '@igor.dvlpr/zing'
import chalk from 'chalk'
import { AriaError } from '../errors/AriaError.mjs'
import { AriaString, AriaStringType } from '../errors/AriaString.mjs'
import { IAriaMessageData } from '../errors/IAriaMessageData.mjs'

export class AriaLog {
  static shouldLog: boolean = false

  static log(message: any = '', ...rest: any[]): void {
    if (this.shouldLog) {
      console.log(zing(message, ...rest))
    }
  }

  static text(data: string | AriaStringType | any = '', ...rest: any[]): void {
    if (typeof data === 'string') {
      console.log(zing(data, ...rest))
    } else if ('message' in data) {
      console.log(zing(data.message, ...rest))
    } else {
      console.log(data)
    }
  }

  static textWarning(message: any, ...rest: any[]): void {
    console.warn(
      `${chalk.bgHex('#EE9A4D').bold(' WARNING ')} ${chalk.dim(
        zing(message, ...rest)
      )}`
    )
  }

  static textInfo(message: any, ...rest: any[]): void {
    console.warn(
      `${chalk.bgHex('#728FCE').bold(' INFO ')} ${chalk.dim(
        zing(message, ...rest)
      )}`
    )
  }

  static textError(message: any): void {
    console.error(`${chalk.bgHex('#8B0000').bold(' ERROR ')} ${message}`)
  }

  static textSuccess(message: any): void {
    console.log(`${chalk.bgHex('#008000').bold(' SUCCESS ')} ${message}`)
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
