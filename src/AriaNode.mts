import { AriaNodeType } from './AriaNodeType.mjs'

export type AriaNode = {
  type: AriaNodeType
  line: number
  range: [number, number]
  value?: string
  flags?: string[]
}
