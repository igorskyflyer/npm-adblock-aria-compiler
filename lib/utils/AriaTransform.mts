import { AriaItemType } from '../models/flags/AriaItemType.mjs'
import { AriaSortBy } from '../models/flags/AriaSortBy.mjs'
import { AriaStripKind } from '../models/flags/AriaStripKind.mjs'

const expModifiers: RegExp = /\$.*$/gim
const expComments: RegExp = /^[\s\t]*!.*/gim

type AriaTransformResult = string | undefined

function applyTransform(
  source: string,
  transform: (item: string, itemKind: AriaItemType) => AriaTransformResult
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

    const transformed: string | undefined = transform(lines[i], itemKind)

    if (transformed) {
      result.push(transformed)
    }
  }

  return result.join('\n')
}

export function sort(source: string, sortBy: AriaSortBy): string {
  if (typeof source !== 'string') {
    return ''
  }

  const lines: string[] = source.split('\n')

  if (sortBy === 'desc') {
  } else {
  }

  return lines.join('\n')
}
export function dedupe(source: string): string {
  const tmp: string[] = []

  return applyTransform(
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
  return applyTransform(source, (item: string, _): AriaTransformResult => {
    return item.trim()
  })
}

export function strip(source: string, strip: number): string {
  if (strip !== AriaStripKind.modifiers && strip !== AriaStripKind.comments) {
    return ''
  }

  if (strip === AriaStripKind.modifiers) {
    return applyTransform(
      source,
      (item: string, itemKind: AriaItemType): AriaTransformResult => {
        if (itemKind === AriaItemType.rule) {
          return item.replace(expModifiers, '')
        }

        return item
      }
    )
  } else if (strip === AriaStripKind.comments) {
    return applyTransform(
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

  return applyTransform(
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
