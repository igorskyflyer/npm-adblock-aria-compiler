import { Aria } from './Aria.mjs'

const aria = new Aria(true)

console.time('perf')
const ast = aria.parseFile('./data/test.adbt')
console.timeEnd('perf')

ast.compile()

// if (ast.export('./a.json')) {
//   console.log('Wrote to JSON')
// }

console.log(ast.nodes)
