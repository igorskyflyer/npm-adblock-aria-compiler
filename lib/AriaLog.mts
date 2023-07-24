type LogLevel = 'log' | 'warn' | 'error' | 'info'

export class AriaLog {
  static shouldLog: boolean = false

  static log(message: any = '', logLevel: LogLevel = 'log'): void {
    if (this.shouldLog) {
      console[logLevel](message)
    }
  }

  static logNewline(): void {
    this.log()
  }
}
