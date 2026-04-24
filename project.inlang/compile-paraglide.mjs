import { compile } from '@inlang/paraglide-js'

export const paraglideCompilerOptions = {
  project: './project.inlang',
  outdir: './src/paraglide',
  strategy: ['url', 'cookie', 'baseLocale'],
}

await compile(paraglideCompilerOptions)