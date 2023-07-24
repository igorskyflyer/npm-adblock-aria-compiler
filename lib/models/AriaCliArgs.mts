import { AriaVersioning } from '../utils/AriaVersioning.mjs'
import { AriaTemplatePath } from './AriaTemplatePath.mjs'

export type AriaCliArgs = {
  api?: boolean
  file?: AriaTemplatePath
  quiet?: boolean
  dry?: boolean
  log?: boolean
  versioning?: AriaVersioning
}
