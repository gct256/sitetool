import * as autoprefixer from 'autoprefixer';
import cssMqpacker from 'css-mqpacker';
import * as cssnano from 'cssnano';
import * as path from 'path';
import * as postcss from 'postcss';
import postcssSorting from 'postcss-sorting';
import stylefmt from 'stylefmt';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

const plugins = [
  cssMqpacker(),
  postcssSorting({
    order: [],
    'properties-order': 'alphabetical'
  }),
  autoprefixer.call(autoprefixer, {
    remove: false,
    browsers: [
      '> 5%',
      'Android >= 2.2',
      'iOS >= 5',
      'IE >= 9',
      'Safari >= 5',
      'not dead'
    ]
  })
];

const workProcesser = postcss.call(postcss, [...plugins, stylefmt()]);
const destProcesser = postcss.call(postcss, [
  ...plugins,
  cssnano.call(cssnano)
]);

export async function cssPostcss(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const result: postcss.Result = await (target.distribute
    ? destProcesser
    : workProcesser
  ).process(container.buffer.toString('utf8'), {
    from: path.basename(target.srcPath),
    to: path.basename(target.outPath),
    map: target.distribute
      ? false
      : {
          prev:
            container.sourceMap === null
              ? null
              : container.sourceMap.toString('utf-8'),
          inline: false
        }
  });

  return {
    buffer: new Buffer(result.css, 'utf8'),
    sourceMap: target.distribute
      ? null
      : new Buffer(result.map.toString(), 'utf8')
  };
}
