import chalk from 'chalk'
import { AriaLogLevel } from '../models/AriaLogLevel.mjs'
import { AriaError } from '../errors/AriaError.mjs'
import { IAriaMessageData } from '../errors/IAriaMessageData.mjs'
import { zing } from '@igor.dvlpr/zing'
import { AriaString } from '../errors/AriaString.mjs'

export class AriaLog {
  static shouldLog: boolean = false

  static log(message: any = '', logLevel: AriaLogLevel = 'log'): void {
    if (this.shouldLog) {
      console[logLevel](message)
    }
  }

  static text(text: any = ''): void {
    console.log(text)
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

  static ariaError(
    info: IAriaMessageData,
    lineCursor: number = -1,
    ...args: any[]
  ): AriaError {
    return new AriaError(info, lineCursor, ...args)
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
