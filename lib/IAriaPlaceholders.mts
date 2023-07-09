import { IAriaPlaceholder } from './IAriaPlaceholder.mjs'

export interface IAriaPlaceholders {
  [key: string]: any
  version: IAriaPlaceholder<string>
  filename: IAriaPlaceholder<string>
  entries: IAriaPlaceholder<number>
  lastModified: IAriaPlaceholder<string>
}
