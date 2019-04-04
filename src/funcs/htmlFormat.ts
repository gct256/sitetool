import prettier from 'prettier';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

interface HtmlFormatOptions {
  beautify?: boolean;
}

const developmentOptions: HtmlFormatOptions = {
  beautify: true
};

const productionOptions: HtmlFormatOptions = {
  beautify: true
};

export async function htmlFormat(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const options: HtmlFormatOptions = {
    ...(target.distribute ? productionOptions : developmentOptions),
    ...target.config.getOption<HtmlFormatOptions>(
      'html-format',
      target.distribute
    )
  };

  if (options.beautify) {
    const result: string = prettier.format(container.buffer.toString('utf8'), {
      parser: 'html'
    });

    return {
      buffer: Buffer.from(result, 'utf8'),
      sourceMap: container.sourceMap,
      hasError: false
    };
  }

  return container;
}
