import { BuilderFunc } from '../core/Builder';
import { cssPostcss } from './cssPostcss';
import { fileGzip } from './fileGzip';
import { filePreprocess } from './filePreprocess';
import { htmlFormat } from './htmlFormat';
import { imageMinify } from './imageMinify';
import { jsBundle } from './jsBundle';
import { jsMinify } from './jsMinify';
import { sassCompile } from './sassCompile';

// tslint:disable-next-line:export-name
export const funcMap = new Map<string, BuilderFunc>();

funcMap.set('css-postcss', cssPostcss);
funcMap.set('file-gzip', fileGzip);
funcMap.set('file-preprocess', filePreprocess);
funcMap.set('html-format', htmlFormat);
funcMap.set('image-minify', imageMinify);
funcMap.set('js-minify', jsMinify);
funcMap.set('js-bundle', jsBundle);
funcMap.set('sass-compile', sassCompile);
