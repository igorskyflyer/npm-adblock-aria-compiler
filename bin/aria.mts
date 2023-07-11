#! /usr/bin/env node

// Author: Igor Dimitrijević (@igorskyflyer)

import { Aria } from '../lib/Aria.mjs'
import { AriaAst } from '../lib/AriaAst.mjs'

type AriaAstParsed = AriaAst | undefined

const aria: Aria = new Aria({
  shouldLog: true,
  versioning: 'auto',
})
const ast: AriaAstParsed = aria.parseFile('./data/tesst.adbt')

if (ast) {
  console.log(ast.nodes)
  ast.compile()
}
