import { zing } from '@igor.dvlpr/zing'
import chalk from 'chalk'
import { IAriaMessageData } from './IAriaMessageData.mjs'

export class AriaError extends Error {
  #name: string
  #args: any[]
  #info: IAriaMessageData
  #line: number

  constructor(info: IAriaMessageData, line: number, ...args: any[]) {
    super(info.message)
    this.#name = 'AR'
    this.#args = args
    this.#info = info
    this.#line = line
  }

  formatError(): string {
    if (this.#line > -1) {
      return zing(
        `${chalk.italic.bold(`${this.#name}${this.#info.id}`)} at line ${
          this.#line
        }: ${this.#info.message}`,
        ...this.#args
      )
    } else {
      return zing(
        `${chalk.italic.bold(`${this.#name}${this.#info.id}`)}: ${
          this.#info.message
        }`,
        ...this.#args
      )
    }
  }
}
