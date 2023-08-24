export interface IAriaAction {
  name: string
  allowsParams: boolean
  actualValue?: string
  paramValues?: readonly string[]
  defaultValue?: string
}
