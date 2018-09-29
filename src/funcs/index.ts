import { BuilderFunc } from '../core/Builder';

const funcMap = new Map<string, BuilderFunc | undefined>();

// tslint:disable-next-line:export-name
export async function getFunc(name: string): Promise<BuilderFunc | undefined> {
  const storedFunc = funcMap.get(name);
  if (storedFunc !== undefined) return storedFunc;

  let func: BuilderFunc | null = null;

  switch (name) {
    case 'css-postcss':
      func = (await import('./cssPostcss')).cssPostcss;
      break;

    case 'css-minify':
      func = (await import('./cssMinify')).cssMinify;
      break;

    case 'file-gzip':
      func = (await import('./fileGzip')).fileGzip;
      break;

    case 'file-preprocess':
      func = (await import('./filePreprocess')).filePreprocess;
      break;

    case 'html-format':
      func = (await import('./htmlFormat')).htmlFormat;
      break;

    case 'image-minify':
      func = (await import('./imageMinify')).imageMinify;
      break;

    case 'js-minify':
      func = (await import('./jsMinify')).jsMinify;
      break;

    case 'js-bundle':
      func = (await import('./jsBundle')).jsBundle;
      break;

    case 'sass-compile':
      func = (await import('./sassCompile')).sassCompile;
      break;

    default:
  }

  funcMap.set(name, func === null ? undefined : func);

  return func === null ? undefined : func;
}
