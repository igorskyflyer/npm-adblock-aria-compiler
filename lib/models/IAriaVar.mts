export interface IAriaVar {
  [key: string]: any
  // meta variables
  title: string
  description: string
  // compile variables
  filename: string
  version: string
  lastModified: string
  entries: number
}
