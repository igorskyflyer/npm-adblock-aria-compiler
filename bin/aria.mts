#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import chalk from 'chalk'
import { execSync } from 'child_process'
import { Command, Option } from 'commander'
import figlet from 'figlet'
import { exit } from 'process'
import { Aria } from '../lib/Aria.mjs'
import { AriaAst } from '../lib/AriaAst.mjs'

type AriaAstParsed = AriaAst | undefined

const ariaVersion: string = '1.0.0-alpha (<commit hash>)'
const program = new Command()

console.log(chalk.bold(figlet.textSync('ARIA', 'Slant')))
console.log(chalk.dim.italic(`v${ariaVersion}\n\n`))

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
  console.log(chalk.italic('📘 Opening the official documentation...'))
  execSync(`start "" https://github.com/igorskyflyer/adblock-aria-compiler#readme`)
  exit(0)
}

const aria: Aria = new Aria({
  shouldLog: !cliArgs.quiet ?? true,
  versioning: cliArgs.versioning ?? 'auto',
})

const ast: AriaAstParsed = aria.parseFile(cliArgs.file)

if (ast) {
  if (cliArgs.dry) {
    console.log(ast.nodes)
  }

  ast.compile()
}
