import { html } from 'js-beautify';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function htmlFormat(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const result: string = html(
    container.buffer.toString('utf8'),
    target.config.getOption('html-format')
  );

  return {
    buffer: Buffer.from(result, 'utf8'),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
