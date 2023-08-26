import { AriaNodeType } from '../models/AriaNodeType.mjs'

export const AriaKeywords = {
  commentInternal: '@',
  commentExported: '#',
  include: 'include',
  headerImport: 'header',
  export: 'export',
  newLine: 'nl',
  tag: 'tag',
  import: 'import',
  meta: 'meta',
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

export function getKeywordFromType(node: AriaNodeType): string {
  switch (node) {
    case AriaNodeType.nodeComment: {
      return 'comment'
    }

    case AriaNodeType.nodeExport: {
      return 'export'
    }

    case AriaNodeType.nodeHeader: {
      return 'header'
    }

    case AriaNodeType.nodeImport: {
      return 'import'
    }

    case AriaNodeType.nodeInclude: {
      return 'include'
    }

    case AriaNodeType.nodeNewLine: {
      return 'nl'
    }

    case AriaNodeType.nodeTag: {
      return 'tag'
    }

    case AriaNodeType.nodeMeta: {
      return 'meta'
    }
  }
}
