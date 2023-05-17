import { readFileSync } from 'node:fs'
import { Aria } from './Aria.mjs'

const template = readFileSync('./data/test.adbt')
const source = template?.toString()

const aria = new Aria(source, false)
aria.parse()

// if (ast.export('./a.json')) {
//   console.log('Wrote to JSON')
// }

console.time('perf')
console.log(aria.ast)
console.timeEnd('perf')
