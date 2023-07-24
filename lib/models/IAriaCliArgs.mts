import { AriaVersioning } from '../utils/AriaVersioning.mjs'
import { AriaTemplatePath } from './AriaTemplatePath.mjs'

export interface IAriaCliArgs {
  [key: string]: any
  api?: boolean
  file?: AriaTemplatePath
  dry?: boolean
  log?: boolean
  versioning?: AriaVersioning
}
