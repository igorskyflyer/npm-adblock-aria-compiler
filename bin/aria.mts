// Author: Igor Dimitrijević (@igorskyflyer)

import { Aria } from '../lib/Aria.mjs'

const aria = new Aria({
  shouldLog: true,
  versioning: 'auto',
})
const ast = aria.parseFile('./data/test.adbt')

if (ast) {
  console.log(ast.nodes)
  ast.compile()
}
