import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';
import { gzip } from '../utils/index';

export async function fileGzip(
  container: BuildContainer,
  _target: Target
): Promise<BuildContainer> {
  return {
    buffer: await gzip(container.buffer),
    sourceMap: container.sourceMap,
    hasError: false
  };
}
