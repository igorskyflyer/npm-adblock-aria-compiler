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
    console.warn(`${chalk.bgYellow(' WARNING ')} ${chalk.dim(message)}`)
  }

  static textError(message: any): void {
    console.error(`${chalk.bgHex('#8B0000')(' ERROR ')} ${message}`)
  }

  static textSuccess(message: any): void {
    console.log(`${chalk.bgGreen(' SUCCESS ')} ${message}`)
  }

  static newline(): void {
    console.log()
  }
}
