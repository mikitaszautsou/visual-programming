import * as esbuild from 'esbuild'

let ctx = await esbuild.context({
  entryPoints: ['src/index.js'],
  bundle: true,
  outdir: 'dist',
})

await ctx.watch()

let { host, port } = await ctx.serve({
  servedir: 'dist',
})

console.log({ host, port })