import { Aria } from './Aria.mjs'

const aria = new Aria({
  shouldLog: true,
  headerVersion: 'timestamp',
})
const ast = aria.parseFile('./data/test.adbt')

if (ast) {
  console.log(ast.nodes)
  ast.compile()
  // ast.export('./data/ast.json')
}
