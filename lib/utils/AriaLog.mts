import chalk from 'chalk'
import { AriaLogLevel } from '../models/AriaLogLevel.mjs'

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
    console.warn(`${chalk.bgYellowBright(' WARNING ')} ${chalk.dim(message)}`)
  }

  static textError(message: any): void {
    console.error(`${chalk.bgRedBright(' ERROR ')} ${message}`)
  }

  static textSuccess(message: any): void {
    console.log(`${chalk.bgGreen(' SUCCESS ')} ${message}`)
  }

  static newline(): void {
    console.log()
  }
}
