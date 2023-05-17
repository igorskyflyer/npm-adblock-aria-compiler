import { Aria } from './Aria.mjs'

const aria = new Aria(true)
aria.parseFile('./data/test.adbt')

// if (ast.export('./a.json')) {
//   console.log('Wrote to JSON')
// }

console.time('perf')
console.log(aria.ast.nodes)
console.timeEnd('perf')
