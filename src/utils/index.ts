import * as fs from 'fs-extra';
import * as path from 'path';
import { Emitter, EventType } from '../core/Emitter';

export async function mkdirp(dirPath: string, root: string, emitter: Emitter) {
  if (!(await fs.pathExists(dirPath))) {
    await fs.mkdirp(dirPath);
    emitter.emitForFile(
      EventType.REMOVE_DIRECTORY,
      path.relative(root, dirPath)
    );
  }
}

export async function rmrf(dirPath: string, root: string, emitter: Emitter) {
  if (await fs.pathExists(dirPath)) {
    await fs.remove(dirPath);
    emitter.emitForFile(
      EventType.REMOVE_DIRECTORY,
      path.relative(root, dirPath)
    );
  }
}
