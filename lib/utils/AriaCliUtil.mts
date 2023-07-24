import { AriaCliArgs } from '../models/AriaCliArgs.mjs'

export function isArgsEmpty(args: AriaCliArgs): boolean {
  for (let prop in args) {
    if (prop === 'file') continue

    if (args[prop] != undefined) {
      return false
    }
  }

  return true
}