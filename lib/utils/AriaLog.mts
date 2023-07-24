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

  static textWarning(text: any): void {
    console.warn(`${chalk.bgYellowBright(' WARNING ')} ${chalk.dim(text)}`)
  }

  static textError(text: any): void {
    console.error(`${chalk.bgRedBright(' ERROR ')} ${text}`)
  }

  static textSuccess(text: any): void {
    console.log(`${chalk.bgGreen(' SUCCESS ')} ${text}`)
  }

  static newline(): void {
    console.log()
  }
}
