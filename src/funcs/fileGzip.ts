import * as zlib from 'zlib';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function fileGzip(
  container: BuildContainer,
  // tslint:disable-next-line:variable-name
  _target: Target
): Promise<BuildContainer> {
  return new Promise(
    (resolve: (c: BuildContainer) => void, reject: (error: Error) => void) => {
      zlib.gzip(container.buffer, (err: Error | null, result: Buffer) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve({
            buffer: result,
            sourceMap: container.sourceMap,
            hasError: false
          });
        }
      });
    }
  );
}
