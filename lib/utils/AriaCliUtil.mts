import { accessSync, readFileSync } from 'fs'
import { IAriaCliArgs } from '../models/IAriaCliArgs.mjs'
import { IAriaCliVersion } from '../models/IAriaCliVersion.mjs'

export function isArgsEmpty(args: IAriaCliArgs): boolean {
  for (let prop in args) {
    if (prop === 'file') continue

    if (args[prop] != undefined) {
      return false
    }
  }

  return true
}

export function getVersion(): IAriaCliVersion | null {
  try {
    const version: IAriaCliVersion = { cli: 'N/A', adbt: 'N/A', commit: '#######' }
    const versionPath = './version'

    accessSync(versionPath)

    const versionFile: string = readFileSync('./version', { encoding: 'utf-8' })
    const versionJson: any = JSON.parse(versionFile)

    version.cli = versionJson.cli
    version.adbt = versionJson.adbt
    version.commit = versionJson.commit

    return version
  } catch {
    return null
  }
}
