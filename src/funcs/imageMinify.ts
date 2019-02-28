import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

export async function imageMinify(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  // tslint:disable: no-unsafe-any
  const result: Buffer = await imagemin.buffer(container.buffer, {
    plugins: [
      imageminGifsicle({ interlaced: true }),
      imageminJpegtran({ progressive: true }),
      imageminOptipng(),
      imageminSvgo({
        plugins: [{ removeViewBox: false }]
      }),
      imageminWebp()
    ]
  });
  // tslint:enable: no-unsafe-any

  return {
    buffer: result,
    sourceMap: container.sourceMap,
    hasError: false
  };
}
