import { IAriaAction } from './IAriaAction.mjs'

export interface IAriaStatement {
  value: string
  flags: IAriaAction[]
}

export function createAriaStatement(): IAriaStatement {
  return { value: '', flags: [] }
}
