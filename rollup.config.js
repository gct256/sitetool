import typescript2 from 'rollup-plugin-typescript2';

import pkg from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

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

const targets = [
  {
    ...base,
    output: {
      file: './index.js',
      format: 'cjs'
    }
  }
];

if (isProduction) {
  targets.push({
    ...base,
    output: {
      file: './index.mjs',
      format: 'es'
    }
  });
}

export default targets;
