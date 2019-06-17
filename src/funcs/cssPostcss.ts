import * as path from 'path';

import autoprefixer from 'autoprefixer';
import cssMqpacker from 'css-mqpacker';
import postcss from 'postcss';
import postcssSorting from 'postcss-sorting';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

interface CssPostcssOptions {
  autoprefixer: {
    remove: boolean;
    overrideBrowserslist?: string[];
  };
}

const processerCache: [postcss.Processor | null, postcss.Processor | null] = [
  null,
  null
];

function getProcesser(target: Target): postcss.Processor {
  const index = target.distribute ? 1 : 0;
  const cache = processerCache[index];

  if (cache !== null) return cache;

  const defaultOptions: CssPostcssOptions = {
    autoprefixer: {
      remove: false,
      overrideBrowserslist: target.config.getBrowsers()
    }
  };

  const options: CssPostcssOptions = {
    ...defaultOptions,
    ...target.config.getOption('css-postcss', target.distribute)
  };

  const processor: postcss.Processor = postcss([
    cssMqpacker(),
    postcssSorting({
      order: [],
      'properties-order': 'alphabetical'
    }),
    autoprefixer(options.autoprefixer)
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
    buffer: Buffer.from(result.css, 'utf8'),
    sourceMap: target.distribute
      ? null
      : Buffer.from(result.map.toString(), 'utf8'),
    hasError: false
  };
}
