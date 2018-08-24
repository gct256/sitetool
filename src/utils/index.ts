import * as fs from 'fs-extra';
import * as path from 'path';
import { Emitter } from '../core/Emitter';

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
