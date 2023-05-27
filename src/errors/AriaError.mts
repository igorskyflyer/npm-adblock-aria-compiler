import { zing } from '@igor.dvlpr/zing'
import { AriaExceptionInfo } from './AriaExceptionInfo.mjs'
import { AriaRange } from '../AriaRange.mjs'

export class AriaError extends Error {
  #name: string
  #args: any[]
  #info: AriaExceptionInfo
  #line: number
  #range: AriaRange

  constructor(info: AriaExceptionInfo, line: number, range: AriaRange, ...args: any[]) {
    super(info.message)
    this.#name = 'AR'
    this.#args = args
    this.#info = info
    this.#line = line
    this.#range = range
  }

  formatError(): string {
    const exception = 'error'
    return zing(
      `\x1b[31m${exception}\x1b[90m ${this.#name}${this.#info.id} at line ${this.#line},[${
        (this.#range[0], this.#range[1])
      }]: \x1b[0m${this.#info.message}\x1b[0m`,
      ...this.#args
    )
  }
}
