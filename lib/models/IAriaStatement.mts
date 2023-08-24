import { IAriaAction } from './IAriaAction.mjs'

export interface IAriaStatement {
  value: string
  actions: IAriaAction[]
}

export function createAriaStatement(): IAriaStatement {
  return { value: '', actions: [] }
}
