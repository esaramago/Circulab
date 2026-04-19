import { compile } from '@inlang/paraglide-js'
import { paraglideCompilerOptions } from './paraglide.shared.mjs'

await compile({
  project: './project.inlang',
  outdir: './src/paraglide',
  ...paraglideCompilerOptions,
})
