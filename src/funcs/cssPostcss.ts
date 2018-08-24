import * as autoprefixer from 'autoprefixer';
import cssMqpacker from 'css-mqpacker';
import * as cssnano from 'cssnano';
import * as path from 'path';
import * as postcss from 'postcss';
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

  const processor: postcss.Processor = postcss.call(postcss, [
    cssMqpacker(),
    postcssSorting({
      order: [],
      'properties-order': 'alphabetical'
    }),
    autoprefixer.call(autoprefixer, {
      ...defaultOptions.autoprefixer,
      ...target.config.getOption('cssPostcss')
    }),
    target.distribute ? cssnano.call(cssnano) : stylefmt()
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

  const result: postcss.Result = await getProcesser(target).process(
    container.buffer.toString('utf8'),
    options
  );

  return {
    buffer: new Buffer(result.css, 'utf8'),
    sourceMap: target.distribute
      ? null
      : new Buffer(result.map.toString(), 'utf8'),
    hasError: false
  };
}
