import { Aria } from './Aria.mjs'

const aria = new Aria(false)
const ast = aria.parseFile('./data/test.adbt')

ast?.compile()

if (ast?.export('./data/ast.json')) {
  console.log('Wrote to JSON')
}
