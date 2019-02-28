import * as nodeSass from 'node-sass';
import * as path from 'path';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

async function compile(options: nodeSass.Options): Promise<nodeSass.Result> {
  return new Promise(
    (
      resolve: (result: nodeSass.Result) => void,
      reject: (error: Error) => void
    ) => {
      nodeSass.render(
        options,
        (compileError: Error, result: nodeSass.Result) => {
          if (compileError !== undefined && compileError !== null) {
            reject(compileError);
          } else {
            resolve(result);
          }
        }
      );
    }
  );
}

export async function sassCompile(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  const result: nodeSass.Result = await compile({
    data: container.buffer.toString('utf8'),
    outputStyle: 'expanded',
    includePaths: [target.config.directory.src, path.dirname(target.srcPath)],
    sourceMap: target.distribute
      ? false
      : container.sourceMap === null
      ? true
      : container.sourceMap.toString('utf8')
  });

  return {
    buffer: result.css,
    sourceMap: target.distribute ? result.map : null,
    hasError: false
  };
}
