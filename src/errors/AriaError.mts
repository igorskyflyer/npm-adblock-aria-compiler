import { zing } from '@igor.dvlpr/zing'
import { AriaExceptionInfo } from './AriaExceptionInfo.mjs'

export class AriaError extends Error {
  #name: string
  #args: any[]
  info: AriaExceptionInfo

  constructor(info: AriaExceptionInfo, ...args: any[]) {
    super(info.message)
    this.#name = 'AR'
    this.#args = args
    this.info = info
  }

  formatError(): string {
    const exception = 'error'
    return zing(`\x1b[31m${exception}\x1b[90m ${this.#name}${this.info.id}: \x1b[0m${this.info.message}\x1b[0m`, ...this.#args)
  }
}
