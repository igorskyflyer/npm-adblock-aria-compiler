import type { AriaVersioning } from '../utils/AriaVersioning.mjs'
import type { AriaTemplatePath } from './AriaTemplatePath.mjs'

export interface IAriaCliArgs {
  [key: string]: any
  file?: AriaTemplatePath
  dry?: boolean
  log?: boolean
  tree?: boolean
  versioning?: AriaVersioning
  root?: string
}
