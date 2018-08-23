import * as path from 'path';
import { preprocess } from 'preprocess';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

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
    rel_root: getRelRoot(target)
  };

  preprocess(
    source,
    {
      param(key: string, value: string) {
        context[key] = value;
      }
    },
    {
      srcDir: target.config.directory.src
    }
  );
  const result: string = preprocess(source, context, {
    srcDir: target.config.directory.src
  });

  return {
    buffer: new Buffer(result, 'utf8'),
    sourceMap: container.sourceMap
  };
}
