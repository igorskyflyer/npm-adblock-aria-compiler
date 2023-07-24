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
    return zing(`${this.#name}${this.#info.id} at line ${this.#line + 1}: ${this.#info.message}`, ...this.#args)
  }
}
