#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import chalk from 'chalk'
import { Command, Option } from 'commander'
import figlet from 'figlet'
import { exit } from 'process'
import { Aria } from '../lib/compiler/Aria.mjs'
import { AriaAstParsed } from '../lib/models/AriaAstParsed.mjs'
import { IAriaCliArgs } from '../lib/models/IAriaCliArgs.mjs'
import { isArgsEmpty } from '../lib/utils/AriaCliUtil.mjs'
import { AriaLog } from '../lib/utils/AriaLog.mjs'
import { AriaException } from '../lib/errors/AriaException.mjs'

const ariaVersion: string = '1.1.0 (2f44ec1)'
const program = new Command()

AriaLog.text(chalk.bold(figlet.textSync('ARIA', 'Slant')))
AriaLog.text(chalk.dim.italic(`v${ariaVersion}\n\n`))

program.description(
  chalk.italic(
    '🧬 Meet Aria, an efficient Adblock filter list compiler, with many features that make your maintenance of Adblock filter lists a breeze! 🗡'
  )
)

program
  .option('-f, --file <path>', 'input template file')
  .option('-d, --dry', 'do a dry-run and print the resulting AST')
  .option('-t, --tree', 'print the resulting AST')
  .option('-l, --log', 'enable compilation logging')
  .addOption(
    new Option('-v, --versioning <type>', 'the versioning to use, default: auto').choices(['auto', 'semver', 'timestamp'])
  )
  .parse(process.argv)

const cliArgs: IAriaCliArgs = program.opts()

if (typeof cliArgs.file !== 'string' || cliArgs.file.length === 0) {
  if (!isArgsEmpty(cliArgs)) {
    throw AriaLog.ariaError(AriaException.templateMissing)
  } else {
    program.help()
    exit(0)
  }
}

const aria: Aria = new Aria({
  shouldLog: cliArgs.log ?? false,
  versioning: cliArgs.versioning ?? 'auto',
})

const ast: AriaAstParsed = aria.parseFile(cliArgs.file)

if (ast) {
  if (cliArgs.dry || cliArgs.tree) {
    AriaLog.text(ast.nodes)
  } else {
    ast.compile()
  }
}
