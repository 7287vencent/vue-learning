/* @flow */
// notes v-html v-index v-model v-text 源码在这
// todo v-html v-index v-model v-text 源码在这
import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
