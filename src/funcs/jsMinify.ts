import { MinifyOutput, minify } from 'uglify-js';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function jsMinify(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const result: MinifyOutput = minify(container.buffer.toString('utf8'));

  return {
    buffer: Buffer.from(result.code, 'utf8'),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
