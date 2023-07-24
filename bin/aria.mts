#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import chalk from 'chalk'
import { execSync } from 'child_process'
import { Command, Option } from 'commander'
import figlet from 'figlet'
import { exit } from 'process'
import { Aria } from '../lib/compiler/Aria.mjs'
import { AriaTemplatePath } from '../lib/models/AriaTemplatePath.mjs'
import { AriaLog } from '../lib/utils/AriaLog.mjs'
import { AriaAstParsed } from '../lib/models/AriaAstParsed.mjs'

const ariaVersion: string = '1.0.0-alpha (68f3c94)'
const program = new Command()

AriaLog.text(chalk.bold(figlet.textSync('ARIA', 'Slant')))
AriaLog.text(chalk.dim.italic(`v${ariaVersion}\n\n`))

program
  .version(ariaVersion, '--version')
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
    new Option('-v, --versioning [type]', 'the versioning to use')
      .choices(['auto', 'semver', 'timestamp'])
      .default('auto', '"auto".')
  )
  .parse(process.argv)

const cliArgs = program.opts()

if (cliArgs.api) {
  AriaLog.text(chalk.italic('📘 Opening the official documentation...'))
  execSync(`start "" https://github.com/igorskyflyer/adblock-aria-compiler#readme`)
  exit(0)
}

if (typeof cliArgs.file !== 'string' || cliArgs.file.length === 0) {
  program.help()
  exit(1)
}

const aria: Aria = new Aria({
  shouldLog: !cliArgs.quiet ?? true,
  versioning: cliArgs.versioning ?? 'auto',
})

const ast: AriaAstParsed = aria.parseFile(cliArgs.file as AriaTemplatePath)

if (ast) {
  if (cliArgs.dry) {
    AriaLog.text(ast.nodes)
  } else {
    ast.compile()
  }
}
