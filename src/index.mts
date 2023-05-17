import { readFileSync } from 'node:fs'
import { Aria } from './Aria.mjs'

const template = readFileSync('./data/test.adbt')
const source = template?.toString()

const aria = new Aria(true)
aria.parse(source)

// if (ast.export('./a.json')) {
//   console.log('Wrote to JSON')
// }

console.time('perf')
console.log(aria.ast.nodes)
console.timeEnd('perf')
