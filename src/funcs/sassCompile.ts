import * as nodeSass from 'node-sass';
import * as path from 'path';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function sassCompile(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  return new Promise(
    (resolve: (c: BuildContainer) => void, reject: (error: Error) => void) => {
      nodeSass.render(
        {
          data: container.buffer.toString('utf8'),
          outputStyle: 'expanded',
          includePaths: [
            target.config.directory.src,
            path.dirname(target.srcPath)
          ],
          sourceMap: target.distribute
            ? false
            : container.sourceMap === null
            ? true
            : container.sourceMap.toString('utf8')
        },
        (compileError: Error, result: nodeSass.Result) => {
          if (compileError !== undefined || compileError !== null) {
            reject(compileError);
          } else {
            resolve({
              buffer: result.css,
              sourceMap: target.distribute ? result.map : null,
              hasError: false
            });
          }
        }
      );
    }
  );
}
