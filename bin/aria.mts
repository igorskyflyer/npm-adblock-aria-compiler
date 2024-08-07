#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import chalk from 'chalk'
import { Command, Option } from 'commander'
import figlet from 'figlet'
import { exit } from 'node:process'
import { Aria } from '../lib/compiler/Aria.mjs'
import { AriaErrorString } from '../lib/errors/AriaErrorString.mjs'
import type { AriaAstParsed } from '../lib/models/AriaAstParsed.mjs'
import type { IAriaCliArgs } from '../lib/models/IAriaCliArgs.mjs'
import { isArgsEmpty } from '../lib/utils/AriaCliUtil.mjs'
import { AriaLog } from '../lib/utils/AriaLog.mjs'
import { version } from '../lib/version.mjs'

const program = new Command()

AriaLog.text(chalk.bold(figlet.textSync('ARIA', 'Slant')))

const ariaVersion: string = `CLI:  v${version.cli} (${version.commit})\nADBT: v${version.adbt}`
AriaLog.text(chalk.dim.italic(`${ariaVersion}\n`))

program.description(
  chalk.italic(
    '🧬 Meet Aria, an efficient Adblock filter list compiler, with many features that make your maintenance of Adblock filter lists a breeze! 🦖'
  )
)

program
  .option('-f, --file <path>', 'input template file')
  .option('-r, --root <path>', 'set root directory (CWD)')
  .option('-d, --dry', 'do a dry-run and print the resulting AST')
  .option('-t, --tree', 'print the resulting AST')
  .option('-l, --log', 'enable compilation logging')
  .addOption(
    new Option(
      '-v, --versioning <type>',
      'the versioning to use, default: auto'
    ).choices(['auto', 'semver', 'timestamp'])
  )
  .parse(process.argv)

const cliArgs: IAriaCliArgs = program.opts()

if (typeof cliArgs.file !== 'string' || cliArgs.file.length === 0) {
  if (!isArgsEmpty(cliArgs)) {
    throw AriaLog.ariaThrow(AriaErrorString.templateMissing)
  }

  program.help()
  exit(0)
}

const aria: Aria = new Aria({
  shouldLog: cliArgs.log ?? false,
  versioning: cliArgs.versioning ?? 'auto'
})

const ast: AriaAstParsed = aria.parseFile(cliArgs.file, cliArgs.root)

if (ast) {
  if (cliArgs.dry) {
    AriaLog.text(ast.nodes)
  } else {
    if (cliArgs.tree) {
      AriaLog.text('AST')
      AriaLog.text(ast.nodes)
      AriaLog.newline()
    }

    ast.compile()
  }
}
