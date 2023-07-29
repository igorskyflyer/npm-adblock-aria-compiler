export class AriaPerformance {
  #timestamp: number

  constructor() {
    this.#timestamp = 0
  }

  startProfiling(): void {
    this.#timestamp = performance.now()
  }

  endProfiling(): string {
    const time: string = (performance.now() - this.#timestamp).toFixed(2)
    const result = `${time}ms 💫`

    return result
  }
}
