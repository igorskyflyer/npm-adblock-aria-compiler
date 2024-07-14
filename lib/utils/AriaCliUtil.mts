import type { IAriaCliArgs } from '../models/IAriaCliArgs.mjs'

export function isArgsEmpty(args: IAriaCliArgs): boolean {
  for (const prop in args) {
    if (prop === 'file') continue

    if (args[prop] !== undefined) {
      return false
    }
  }

  return true
}
