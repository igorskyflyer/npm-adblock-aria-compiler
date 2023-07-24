import { AriaVersioning } from '../utils/AriaVersioning.mjs'
import { AriaTemplatePath } from './AriaTemplatePath.mjs'

export interface IAriaCliArgs {
  [key: string]: any
  api?: boolean
  file?: AriaTemplatePath
  quiet?: boolean
  dry?: boolean
  log?: boolean
  versioning?: AriaVersioning
}
