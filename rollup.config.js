import typescript2 from 'rollup-plugin-typescript2';

import pkg from './package.json';

const base = {
  input: './src/index.ts',
  plugins: [
    typescript2({
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: './types'
        },
        include: ['./src/index.ts', './src/missing.d.ts'],
        exclude: ['./node_modules/**/*.*']
      },
      useTsconfigDeclarationDir: true
    })
  ],
  external: ['events', 'path', 'zlib', ...Object.keys(pkg.dependencies)]
};

export default [
  {
    ...base,
    output: {
      file: './index.js',
      format: 'cjs'
    }
  },
  {
    ...base,
    output: {
      file: './index.mjs',
      format: 'es'
    }
  }
];
