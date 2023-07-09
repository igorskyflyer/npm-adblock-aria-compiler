import { Aria } from './Aria.mjs'

const aria = new Aria({
  shouldLog: true,
  versioning: 'timestamp',
})
const ast = aria.parseFile('./data/test.adbt')

if (ast) {
  console.log(ast.nodes)
  ast.compile()
  // ast.export('./data/ast.json')
}
