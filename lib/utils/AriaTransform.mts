import { AriaAction } from '../models/AriaAction.mjs'
import { AriaItemType } from '../models/flags/AriaItemType.mjs'
import { AriaSortBy } from '../models/flags/AriaSortBy.mjs'

type AriaTransformResult = string | undefined
export type AriaTransform = keyof typeof AriaAction

const expModifiers: RegExp = /\$.*$/gim
const expComments: RegExp = /^[\s\t]*!.*/gim

function transform(
  source: string,
  transform: (
    item: string,
    itemKind: AriaItemType,
    index: number,
    items: string[]
  ) => AriaTransformResult
): string {
  if (typeof source !== 'string' || typeof transform !== 'function') {
    return ''
  }

  if (source.length === 0) {
    return ''
  }

  const lines: string[] = source.split('\n')
  const count: number = lines.length
  const result: string[] = []

  for (let i = 0; i < count; i++) {
    const line: string = lines[i]
    let itemKind: AriaItemType = AriaItemType.none

    if (line.trim().indexOf('!') === 0) {
      itemKind = AriaItemType.comment
    } else {
      itemKind = AriaItemType.rule
    }

    const transformed: string | undefined = transform(
      lines[i],
      itemKind,
      i,
      lines
    )

    if (transformed) {
      result.push(transformed)
    }
  }

  return result.join('\n')
}

export function sort(source: string, sortBy: AriaSortBy = 'asc'): string {
  if (typeof source !== 'string') {
    return ''
  }

  let lines: string[] = source.split('\n')

  if (lines.length === 0) {
    return ''
  }

  lines = lines.filter((line: string) => {
    if (line.indexOf('!') !== 0) {
      return line
    }
  })

  if (sortBy === 'desc') {
    return lines
      .sort((a, b) => {
        return a.toLowerCase() < b.toLowerCase() ? 1 : -1
      })
      .join('\n')
  } else {
    return lines
      .sort((a, b) => {
        return a.toLowerCase() < b.toLowerCase() ? -1 : 1
      })
      .join('\n')
  }
}
export function dedupe(source: string): string {
  const tmp: string[] = []

  return transform(
    source,
    (item: string, itemKind: AriaItemType): AriaTransformResult => {
      if (itemKind === AriaItemType.comment) {
        tmp.push(item)
        return item
      }

      if (!tmp.includes(item)) {
        tmp.push(item)
        return item
      } else {
        return
      }
    }
  )
}

export function trim(source: string): string {
  return transform(source, (item: string): AriaTransformResult => {
    return item.trim()
  })
}

export function strip(source: string, strip: string): string {
  if (strip !== 'modifiers' && strip !== 'comments') {
    return ''
  }

  if (strip === 'modifiers') {
    return transform(
      source,
      (item: string, itemKind: AriaItemType): AriaTransformResult => {
        if (itemKind === AriaItemType.rule) {
          return item.replace(expModifiers, '')
        }

        return item
      }
    )
  } else if (strip === 'comments') {
    return transform(
      source,
      (item: string, itemKind: AriaItemType): AriaTransformResult => {
        if (itemKind === AriaItemType.comment) {
          return item.replace(expComments, '')
        }

        return item
      }
    )
  } else {
    return ''
  }
}

export function append(source: string, value: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return source
  }

  return transform(
    source,
    (item: string, itemKind: AriaItemType): AriaTransformResult => {
      if (itemKind !== AriaItemType.comment) {
        return `${item}${value}`
      } else {
        return item
      }
    }
  )
}

const flagTransformers: Record<string, Function> = {
  sort,
  dedupe,
  trim,
  strip,
  append,
}

export function applyTransform(
  transformName: AriaTransform,
  source: string,
  param?: any
): string {
  if (transformName in flagTransformers) {
    return flagTransformers[transformName](source, param)
  }

  return source
}
