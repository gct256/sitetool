import * as path from 'path';
import * as zlib from 'zlib';

import * as fs from 'fs-extra';

import { Emitter } from '../core/Emitter';

export const DEVELOPMENT = 'development';

export const PRODUCTION = 'production';

export async function mkdirp(dirPath: string, root: string, emitter: Emitter) {
  if (!(await fs.pathExists(dirPath))) {
    const relPath = path.relative(root, dirPath);

    try {
      await fs.mkdirp(dirPath);
      emitter.emit('MAKE_DIRECTORY', { relPath, error: false });
    } catch (error) {
      emitter.emit('MAKE_DIRECTORY', { relPath, error });
    }
  }
}

export async function rmrf(dirPath: string, root: string, emitter: Emitter) {
  if (await fs.pathExists(dirPath)) {
    const relPath = path.relative(root, dirPath);

    try {
      await fs.remove(dirPath);
      emitter.emit('REMOVE_DIRECTORY', { relPath, error: false });
    } catch (error) {
      emitter.emit('REMOVE_DIRECTORY', { relPath, error });
    }
  }
}

export async function gzip(buffer: Buffer): Promise<Buffer> {
  return new Promise(
    (resolve: (buffer: Buffer) => void, reject: (er: Error) => void) => {
      zlib.gzip(buffer, (err: Error | null, result: Buffer) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  );
}

export async function gunzip(buffer: Buffer): Promise<Buffer> {
  return new Promise(
    (resolve: (buffer: Buffer) => void, reject: (er: Error) => void) => {
      zlib.gunzip(buffer, (err: Error | null, result: Buffer) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }
  );
}
