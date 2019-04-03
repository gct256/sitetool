declare type ImageminHandler = (buffer: Buffer) => Buffer;
declare type ImageminPlugin = (option?: object) => ImageminHandler;

declare module 'imagemin-gifsicle' {
  const imageminGifsicle: ImageminPlugin;
  export default imageminGifsicle;
}

declare module 'imagemin-jpegtran' {
  const imageminJpegtran: ImageminPlugin;
  export default imageminJpegtran;
}

declare module 'imagemin-optipng' {
  const imageminOptipng: ImageminPlugin;
  export default imageminOptipng;
}

declare module 'imagemin-svgo' {
  const imageminSvgo: ImageminPlugin;
  export default imageminSvgo;
}

declare module 'imagemin-webp' {
  const imageminWebp: ImageminPlugin;
  export default imageminWebp;
}

declare module 'imagemin' {
  namespace imagemin {
    export const buffer: (buffer: Buffer, option: object) => Promise<Buffer>;
  }
  export default imagemin;
}

declare module 'css-mqpacker';
declare module 'postcss-sorting';

declare module 'rollup-plugin-babel';
declare module '@babel/preset-env';

declare module 'strip-comments';
