import { readFileSync } from 'fs-extra';
import { HelperOptions, SafeString, compile, registerHelper } from 'handlebars';
import * as path from 'path';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

// tslint:disable-next-line:no-any
function applyTemplate(file: string, data: any) {
  // tslint:disable-next-line: no-unsafe-any
  const tmpl = compile(readFileSync(path.resolve(data.src_dir, file), 'utf8'));

  return tmpl(data);
}

// include
registerHelper('--', (file: string, options: HelperOptions) => {
  // tslint:disable-next-line: no-unsafe-any
  return new SafeString(applyTemplate(file, options.data.root));
});

// variable
registerHelper('::', (name: string, value: string, options: HelperOptions) => {
  // tslint:disable-next-line: no-unsafe-any
  const root = options.data.root;
  if (typeof root === 'object' && root !== null) {
    // tslint:disable-next-line: no-unsafe-any
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
    ...target.config.getOption('file-preprocess'),
    rel_root: getRelRoot(target),
    src_dir: target.config.directory.src
  };

  const tmpl = compile(source);
  const result: string = tmpl(context);

  return {
    buffer: new Buffer(result, 'utf8'),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
