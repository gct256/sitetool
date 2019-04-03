import prettier from 'prettier';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function htmlFormat(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const result: string = prettier.format(container.buffer.toString('utf8'), {
    parser: 'html'
  });

  return {
    buffer: Buffer.from(result, 'utf8'),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
