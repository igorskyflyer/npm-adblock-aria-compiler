import { AriaNodeType } from '../models/AriaNodeType.mjs'

export const MINIMUM_IDENTIFIER_LENGTH: number = 3
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

export function getMinimumKeywordIdentifier(): string[] {
  return Object.keys(AriaKeywords).map((prop: string, _) => {
    return AriaKeywords[prop as keyof typeof AriaKeywords].substring(
      0,
      MINIMUM_IDENTIFIER_LENGTH
    )
  })
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
