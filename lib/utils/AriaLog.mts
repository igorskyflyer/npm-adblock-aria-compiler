import chalk from 'chalk'
import { AriaLogLevel } from '../models/AriaLogLevel.mjs'
import { AriaError } from '../errors/AriaError.mjs'
import { IAriaExceptionInfo } from '../errors/IAriaExceptionInfo.mjs'

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

  static textWarning(message: any): void {
    console.warn(`${chalk.bgHex('#1E90FF').bold(' WARNING ')} ${chalk.dim(message)}`)
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

  static ariaError(info: IAriaExceptionInfo, lineCursor: number = -1, ...args: any[]): AriaError {
    return new AriaError(info, lineCursor, args)
  }
}
