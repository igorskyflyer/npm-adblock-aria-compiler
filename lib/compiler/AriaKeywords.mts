export const AriaKeywords = {
  commentInternal: '@',
  commentExported: '#',
  include: 'include',
  headerImport: 'header',
  export: 'export',
  newLine: 'nl',
  tag: 'tag',
  import: 'import',
} as const

export function getLongestKeyword(): string {
  let longest: number = 0
  let result: string = ''

  for (const prop in AriaKeywords) {
    const keyword: string = AriaKeywords[prop as keyof typeof AriaKeywords]
    const count: number = keyword.length

    if (count > longest) {
      longest = count
      result = keyword
    }
  }

  return result
}
