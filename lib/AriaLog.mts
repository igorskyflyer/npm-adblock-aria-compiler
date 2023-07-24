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

  static textWarning(message: string): void {
    console.warn(`${chalk.bgYellowBright(' WARNING ')} ${chalk.dim(message)}`)
  }

  static textError(message: string): void {
    console.error(`${chalk.bgRedBright(' ERROR ')} ${message}`)
  }

  static logNewline(): void {
    this.log()
  }
}
