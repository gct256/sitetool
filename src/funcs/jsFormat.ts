import prettier from 'prettier';
import { MinifyOutput, minify } from 'uglify-js';
import stripComments from 'strip-comments';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

interface JsFormatOptions {
  beautify?: boolean;
  minify?: boolean;
}

const developmentOptions: JsFormatOptions = {
  beautify: true
};

const productionOptions: JsFormatOptions = {
  minify: true
};

export async function jsFormat(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const options: JsFormatOptions = {
    ...(target.distribute ? productionOptions : developmentOptions),
    ...target.config.getOption<JsFormatOptions>('js-format', target.distribute)
  };

  if (options.beautify) {
    const result = prettier.format(container.buffer.toString('utf8'), {
      parser: 'babel'
    });

    return {
      buffer: Buffer.from(
        stripComments(result, {
          line: true,
          block: false
        }),
        'utf8'
      ),
      sourceMap: container.sourceMap,
      hasError: false
    };
  }

  if (options.minify) {
    const result: MinifyOutput = minify(container.buffer.toString('utf8'));

    return {
      buffer: Buffer.from(result.code, 'utf8'),
      sourceMap: container.sourceMap,
      hasError: false
    };
  }

  return container;
}
