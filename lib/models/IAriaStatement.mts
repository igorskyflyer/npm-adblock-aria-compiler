import { IAriaFlag } from './IAriaFlag.mjs'

export interface IAriaStatement {
  value: string
  flags: IAriaFlag[]
}

export function createAriaStatement(): IAriaStatement {
  return { value: '', flags: [] }
}
