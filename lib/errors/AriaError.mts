import { zing } from '@igor.dvlpr/zing'
import { IAriaExceptionInfo } from './IAriaExceptionInfo.mjs'
import chalk from 'chalk'

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
    if (this.#line > -1) {
      return zing(
        `${chalk.italic.bold(`${this.#name}${this.#info.id}`)} at line ${this.#line}: ${this.#info.message}`,
        ...this.#args
      )
    } else {
      return zing(`${chalk.italic.bold(`${this.#name}${this.#info.id}`)}: ${this.#info.message}`, ...this.#args)
    }
  }
}
