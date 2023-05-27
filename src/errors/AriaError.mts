export class AriaError extends Error {
  #message: string
  #name: string
  #id: number

  constructor(id: number, message: string, ...args: string[]) {
    super(message)
    this.#id = id
    this.#message = message
    this.#name = 'AR'
  }

  formatError(): string {
    const exception = 'error'
    return `\x1b[31m${exception}\x1b[90m ${this.#name}${this.#id}: \x1b[0m${this.#message}\x1b[0m`
  }
}
