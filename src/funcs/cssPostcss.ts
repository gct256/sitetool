import autoprefixer from 'autoprefixer';
import cssMqpacker from 'css-mqpacker';
import * as path from 'path';
import postcss from 'postcss';
import postcssSorting from 'postcss-sorting';
import stylefmt from 'stylefmt';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

// tslint:disable-next-line:no-any
const defaultOptions: { [key: string]: any } = {
  autoprefixer: {
    remove: false,
    browsers: ['> 5%', 'not dead']
  }
};

const processerCache: [postcss.Processor | null, postcss.Processor | null] = [
  null,
  null
];

function getProcesser(target: Target): postcss.Processor {
  const index = target.distribute ? 1 : 0;
  const cache = processerCache[index];
  if (cache !== null) return cache;

  const processor: postcss.Processor = postcss([
    // tslint:disable-next-line: no-unsafe-any
    cssMqpacker(),
    // tslint:disable-next-line: no-unsafe-any
    postcssSorting({
      order: [],
      'properties-order': 'alphabetical'
    }),
    // tslint:disable-next-line: no-unsafe-any
    autoprefixer.call(autoprefixer, {
      ...defaultOptions.autoprefixer,
      ...target.config.getOption('cssPostcss')
    }),
    // tslint:disable-next-line: no-unsafe-any
    stylefmt()
  ]);
  processerCache[index] = processor;

  return processor;
}

export async function cssPostcss(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const options: postcss.ProcessOptions = {
    from: path.basename(target.srcPath),
    to: path.basename(target.outPath)
  };

  if (!target.distribute) {
    options.map = {
      prev:
        container.sourceMap === null
          ? null
          : container.sourceMap.toString('utf-8'),
      inline: false
    };
  }

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
