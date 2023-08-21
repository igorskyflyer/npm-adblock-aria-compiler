export interface IAriaFlag {
  name: string
  allowsParams: boolean
  actualValue?: string
  paramValues?: readonly string[]
  defaultValue?: string
}
