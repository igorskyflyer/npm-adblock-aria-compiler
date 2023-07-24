#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import chalk from 'chalk'
import { execSync } from 'child_process'
import { Command, Option } from 'commander'
import figlet from 'figlet'
import { exit } from 'process'
import { Aria } from '../lib/compiler/Aria.mjs'
import { AriaAstParsed } from '../lib/models/AriaAstParsed.mjs'
import { IAriaCliArgs } from '../lib/models/IAriaCliArgs.mjs'
import { AriaLog } from '../lib/utils/AriaLog.mjs'
import { isArgsEmpty } from '../lib/utils/AriaCliUtil.mjs'

const ariaVersion: string = '1.0.0-alpha (e856673)'
const program = new Command()

AriaLog.text(chalk.bold(figlet.textSync('ARIA', 'Slant')))
AriaLog.text(chalk.dim.italic(`v${ariaVersion}\n\n`))

program
  .description(
    chalk.italic(
      '🧬 Meet Aria, an efficient Adblock filter list compiler, with many features that make your maintenance of Adblock filter lists a breeze! 🗡'
    )
  )
  .option('--api', 'open the official API documentation')
  .option('-f, --file <path>', 'input template file')
  .option('-q, --quiet', 'disable compilation logging')
  .option('-d, --dry', 'do a dry-run and output the resulting AST')
  .option('-l, --log <path>', 'write log file')
  .addOption(
    new Option('-v, --versioning <type>', 'the versioning to use, default: auto').choices(['auto', 'semver', 'timestamp'])
  )
  .parse(process.argv)

const cliArgs: IAriaCliArgs = program.opts()

if (cliArgs.api) {
  AriaLog.text(chalk.italic('📘 Opening the official documentation...'))
  execSync(`start "" https://github.com/igorskyflyer/adblock-aria-compiler#readme`)
  exit(0)
}

if (typeof cliArgs.file !== 'string' || cliArgs.file.length === 0) {
  if (!isArgsEmpty(cliArgs)) {
    AriaLog.textError('missing template path.')
    AriaLog.newline()
    exit(1)
  } else {
    program.help()
    exit(0)
  }
}

const aria: Aria = new Aria({
  shouldLog: !cliArgs.quiet ?? true,
  versioning: cliArgs.versioning ?? 'auto',
})

const ast: AriaAstParsed = aria.parseFile(cliArgs.file)

if (ast) {
  if (cliArgs.dry) {
    AriaLog.text(ast.nodes)
  } else {
    ast.compile()
  }
}
