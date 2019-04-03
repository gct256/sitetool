import typescript2 from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';

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
    }),
    autoExternal()
  ]
};

const targets = [
  {
    ...base,
    output: {
      dir: 'lib',
      format: 'cjs',
      chunkFileNames: '[name]-[hash].js',
      entryFileNames: '[name].js'
    }
  }
];

if (isProduction) {
  targets.push({
    ...base,
    output: {
      dir: 'lib',
      format: 'es',
      chunkFileNames: '[name]-[hash].mjs',
      entryFileNames: '[name].mjs'
    }
  });
}

export default targets;
