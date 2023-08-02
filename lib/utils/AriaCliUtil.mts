import { IAriaCliArgs } from '../models/IAriaCliArgs.mjs'

export function isArgsEmpty(args: IAriaCliArgs): boolean {
  for (let prop in args) {
    if (prop === 'file') continue

    if (args[prop] != undefined) {
      return false
    }
  }

  return true
}
