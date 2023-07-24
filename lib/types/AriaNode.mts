import { AriaNodeType } from '../AriaNodeType.mjs'

export type AriaNode = {
  type: AriaNodeType
  line: number
  value?: string
  flags?: string[]
}
