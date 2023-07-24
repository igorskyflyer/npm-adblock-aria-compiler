import chalk from 'chalk'

type LogLevel = 'log' | 'warn' | 'error' | 'info'

export class AriaLog {
  static shouldLog: boolean = false

  static log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.shouldLog) {
      console[logLevel](message)
    }
  }

  static text(message: any = ''): void {
    console.log(message)
  }

  static textWarning(text: string): void {
    console.warn(`${chalk.bgYellowBright(' WARNING ')} ${chalk.dim(text)}`)
  }

  static textError(text: string): void {
    console.error(`${chalk.bgRedBright(' ERROR ')} ${text}`)
  }

  static textSuccess(text: string): void {
    console.log(`${chalk.bgGreenBright(' SUCCESS ')} ${text}`)
  }

  static logNewline(): void {
    this.log()
  }
}
