import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function imageMinify(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const result: Buffer = await imagemin.buffer(container.buffer, {
    plugins: [
      imageminGifsicle({ interlaced: true }),
      imageminJpegtran({ progressive: true }),
      imageminOptipng(),
      imageminSvgo({
        plugins: [{ removeViewBox: false }]
      })
    ]
  });

  return {
    buffer: result,
    sourceMap: container.sourceMap,
    hasError: false
  };
}
