import cssnano from 'cssnano';
import * as path from 'path';
import postcss from 'postcss';
import prettier from 'prettier';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

interface CssFormatOptions {
  beautify?: boolean;
  minify?: boolean;
}

const developmentOptions: CssFormatOptions = {
  beautify: true,
  minify: false
};

const productionOptions: CssFormatOptions = {
  beautify: false,
  minify: true
};

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

export async function cssFormat(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const options: CssFormatOptions = {
    ...(target.distribute ? productionOptions : developmentOptions),
    ...target.config.getOption<CssFormatOptions>(
      'css-format',
      target.distribute
    )
  };

  if (options.beautify) {
    return {
      buffer: Buffer.from(
        prettier.format(container.buffer.toString('utf8'), {
          parser: 'css'
        }),
        'utf8'
      ),
      sourceMap: target.distribute ? null : container.sourceMap,
      hasError: false
    };
  }

  if (options.minify) {
    const postcssOptions: postcss.ProcessOptions = {
      from: path.basename(target.srcPath),
      to: path.basename(target.outPath)
    };
    if (!target.distribute) {
      if (container.sourceMap !== null) {
        postcssOptions.map = {
          prev: container.sourceMap.toString('utf8')
        };
      } else {
        postcssOptions.map = true;
      }
    }

    const result: postcss.Result = await getProcesser(target).process(
      container.buffer.toString('utf8'),
      postcssOptions
    );

    return {
      buffer: Buffer.from(result.css, 'utf8'),
      sourceMap: result.map ? Buffer.from(result.map.toString(), 'utf8') : null,
      hasError: false
    };
  }

  return container;
}
