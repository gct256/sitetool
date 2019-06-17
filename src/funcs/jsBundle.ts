import * as path from 'path';

import * as env from '@babel/preset-env';
import { SourceMap, rollup } from 'rollup';
import rollupPluginBabel from 'rollup-plugin-babel';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

function getSourceMap(map: SourceMap | null | undefined): Buffer | null {
  if (map === undefined || map === null) return null;

  return Buffer.from(map.toString(), 'utf8');
}

export async function jsBundle(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const bundle = await rollup({
    input: target.srcPath,
    plugins: [
      rollupPluginBabel({
        inputSourceMap:
          !target.distribute && container.sourceMap
            ? container.sourceMap
            : false,
        sourceMaps: !target.distribute,
        presets: [
          [
            env,
            {
              targets: {
                browsers: target.config.getBrowsers(),
                ...target.config.getOption('jsBundle', target.distribute)
              }
            }
          ]
        ]
      })
    ]
  });
  const { output } = await bundle.generate({
    format: 'iife',
    sourcemap: !target.distribute
  });
  const { code, map } = output[0];

  return {
    buffer: Buffer.from(
      code +
        (target.distribute
          ? ''
          : `
//# sourceMappingURL=${path.basename(target.outPath)}.map
`),
      'utf8'
    ),
    sourceMap: getSourceMap(map),
    hasError: false
  };
}
