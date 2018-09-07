import { SourceMap, rollup } from 'rollup';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

function getSourceMap(map: SourceMap | undefined): Buffer | null {
  if (map === undefined) return null;

  return new Buffer(map.toString(), 'utf8');
}

export async function jsBundle(
  // tslint:disable-next-line:variable-name
  _container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const bundle = await rollup({
    input: target.srcPath
  });
  const { code, map } = await bundle.generate({
    format: 'iife',
    sourcemap: !target.distribute
  });

  return {
    buffer: new Buffer(code, 'utf8'),
    sourceMap: getSourceMap(map),
    hasError: false
  };
}