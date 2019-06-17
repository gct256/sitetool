import * as path from 'path';

import { readFileSync } from 'fs-extra';
import { HelperOptions, SafeString, compile, registerHelper } from 'handlebars';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

function applyTemplate(file: string, data: any) {
  const tmpl = compile(
    readFileSync(path.resolve(data.__srcDir__, file), 'utf8')
  );

  return tmpl(data);
}

// include
registerHelper('$$', (file: string, options: HelperOptions) => {
  return new SafeString(applyTemplate(file, options.data.root));
});

// variable
registerHelper('::', (name: string, value: string, options: HelperOptions) => {
  const {root} = options.data;

  if (typeof root === 'object' && root !== null) {
    root[name] = value;
  }

  return '';
});

function getRelRoot(target: Target): string {
  const rel: string = path.relative(
    path.dirname(target.srcPath),
    target.config.directory.src
  );

  return rel.length === 0 ? '.' : rel;
}

export async function filePreprocess(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const source: string = container.buffer.toString('utf8');
  const context: { [key: string]: string } = {
    ...target.config.getOption('file-preprocess', target.distribute),
    __relativeRoot__: getRelRoot(target),
    __srcDir__: target.config.directory.src
  };

  const tmpl = compile(source);
  const result: string = tmpl(context);

  return {
    buffer: Buffer.from(result, 'utf8'),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
