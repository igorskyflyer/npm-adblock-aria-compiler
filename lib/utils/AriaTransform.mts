import type { AriaAction } from '../models/AriaAction.mjs'
import { AriaItemType } from '../models/actions/AriaItemType.mjs'
import type { AriaSortBy } from '../models/actions/AriaSortBy.mjs'

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

  let transformedValue: string = result.join('\n')

  if (transformedValue.at(-1) !== '\n') {
    transformedValue += '\n'
  }

  return transformedValue
}

export function sort(source: string, sortBy: AriaSortBy = 'asc'): string {
  if (typeof source !== 'string') {
    return ''
  }

  let lines: string[] = source.split('\n')

  if (lines.length === 0) {
    return ''
  }

  let result: string = ''

  lines = lines.filter((line: string) => {
    if (line.indexOf('!') !== 0) {
      return line
    }
  })

  if (sortBy === 'desc') {
    lines = lines.sort((a, b) => {
      return a.toLowerCase() < b.toLowerCase() ? 1 : -1
    })
  } else {
    lines = lines.sort((a, b) => {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1
    })
  }

  result = lines.join('\n')

  if (result.at(-1) !== '\n') {
    result += '\n'
  }

  return result
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
      }

      return
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
  }

  if (strip === 'comments') {
    return transform(
      source,
      (item: string, itemKind: AriaItemType): AriaTransformResult => {
        if (itemKind === AriaItemType.comment) {
          return item.replace(expComments, '')
        }

        return item
      }
    )
  }

  return ''
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
      }

      return item
    }
  )
}

const actionTransformers: Record<string, Function> = {
  sort,
  dedupe,
  trim,
  strip,
  append
}

export function applyTransform(
  transformName: AriaTransform,
  source: string,
  param?: any
): string {
  if (transformName in actionTransformers) {
    return actionTransformers[transformName](source, param)
  }

  return source
}
