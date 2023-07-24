import { zing } from '@igor.dvlpr/zing'
import { IAriaExceptionInfo } from './IAriaExceptionInfo.mjs'

export class AriaError extends Error {
  #name: string
  #args: any[]
  #info: IAriaExceptionInfo
  #line: number

  constructor(info: IAriaExceptionInfo, line: number, ...args: any[]) {
    super(info.message)
    this.#name = 'AR'
    this.#args = args
    this.#info = info
    this.#line = line
  }

  formatError(): string {
    const exception: string = 'error'

    const line: number = this.#line + 1

    return zing(
      `\x1b[31m${exception}\x1b[90m ${this.#name}${this.#info.id} at line ${line}: \x1b[0m${this.#info.message}\x1b[0m`,
      ...this.#args
    )
  }
}
