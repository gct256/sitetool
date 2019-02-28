import cssnano from 'cssnano';
import * as path from 'path';
import postcss from 'postcss';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

const processerCache: [postcss.Processor | null, postcss.Processor | null] = [
  null,
  null
];

function getProcesser(target: Target): postcss.Processor {
  const index = target.distribute ? 1 : 0;
  const cache = processerCache[index];
  if (cache !== null) return cache;

  const processor: postcss.Processor = postcss([cssnano()]);
  processerCache[index] = processor;

  return processor;
}

export async function cssMinify(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const options: postcss.ProcessOptions = {
    from: path.basename(target.srcPath),
    to: path.basename(target.outPath)
  };

  options.map = {
    prev:
      container.sourceMap === null
        ? null
        : container.sourceMap.toString('utf-8'),
    inline: false
  };

  // tslint:disable-next-line: await-promise
  const result: postcss.Result = await getProcesser(target).process(
    container.buffer.toString('utf8'),
    options
  );

  return {
    buffer: Buffer.from(result.css, 'utf8'),
    sourceMap: target.distribute
      ? null
      : Buffer.from(result.map.toString(), 'utf8'),
    hasError: false
  };
}
