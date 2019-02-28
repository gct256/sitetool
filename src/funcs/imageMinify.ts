import imagemin from 'imagemin';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';
import * as path from 'path';

import { BuildContainer } from '../core/Builder';
import { Target } from '../core/Target';

const plugins: { [key: string]: ImageminHandler } = {
  gif: imageminGifsicle({ interlaced: true }),
  jpeg: imageminJpegtran({ progressive: true }),
  png: imageminOptipng(),
  svg: imageminSvgo({
    plugins: [{ removeViewBox: false }]
  }),
  webp: imageminWebp()
};

function getPlugin(target: Target): ImageminHandler[] {
  switch (path.extname(target.relPath).toLowerCase()) {
    case '.gif':
      return [plugins.gif];
    case '.jpeg':
    case '.jpg':
      return [plugins.jpeg];
    case '.png':
      return [plugins.png];
    case '.svg':
    case '.svgz':
      return [plugins.svg];
    case '.webp':
      return [plugins.webp];
    default:
      return [plugins.gif, plugins.jpeg, plugins.png, plugins.svg];
  }
}

export async function imageMinify(
  container: BuildContainer,
  target: Target
): Promise<BuildContainer> {
  if (!target.distribute) return container;

  const result: Buffer = await imagemin.buffer(container.buffer, {
    plugins: getPlugin(target)
  });

  return {
    buffer: result,
    sourceMap: container.sourceMap,
    hasError: false
  };
}
