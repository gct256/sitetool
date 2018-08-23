import * as fs from 'fs-extra';
import * as path from 'path';

import { funcMap } from '../funcs';
import { Config } from './Config';
import { Emitter, EventType } from './Emitter';
import { Target } from './Target';

export interface BuildContainer {
  buffer: Buffer;
  sourceMap: Buffer | null;
}

export type BuilderFunc = (
  container: BuildContainer,
  target: Target
) => Promise<BuildContainer>;

export const BuilderEventType = {
  transform: 'transform',
  write: 'write'
};

const builderCache: Map<string[], Builder> = new Map();

async function isNeedUpdate(
  srcPath: string,
  outPath: string
): Promise<boolean> {
  if (!(await fs.pathExists(outPath))) return true;
  if (!(await fs.pathExists(srcPath))) return false;

  const srcStat = await fs.stat(srcPath);
  const outStat = await fs.stat(outPath);

  return srcStat.mtime.valueOf() > outStat.mtime.valueOf();
}

export class Builder {
  private emitter: Emitter;
  private names: string[];
  private funcs: BuilderFunc[];

  private constructor(emitter: Emitter, names: string[]) {
    this.emitter = emitter;
    this.names = [];
    this.funcs = [];
    for (const name of names) {
      const func = funcMap.get(name);
      if (func !== undefined) {
        this.names.push(name);
        this.funcs.push(func);
      }
    }
  }

  public static getBuilder(names: string[], emitter: Emitter) {
    const builder = builderCache.get(names);

    return builder === undefined ? new Builder(emitter, names) : builder;
  }

  public async build(target: Target, force: boolean): Promise<void> {
    if (!force) {
      if (!isNeedUpdate(target.srcPath, target.outPath)) {
        return;
      }
    }

    const result: BuildContainer = await this.funcs.reduce(
      (prev: Promise<BuildContainer>, func: BuilderFunc, index: number) => {
        return prev.then((container: BuildContainer) => {
          const next = func(container, target);
          this.emitter.emitForTransform(this.names[index], target.relPath);

          return next;
        });
      },
      Promise.resolve({
        buffer: await fs.readFile(target.srcPath),
        sourceMap: null
      })
    );

    const outDir = path.dirname(target.outPath);
    if (!(await fs.pathExists(outDir))) {
      await fs.mkdirp(outDir);
    }
    await fs.writeFile(target.outPath, result.buffer);
    this.emitter.emitForFile(EventType.WRITE_FILE, target.relPath);
    if (result.sourceMap !== null && !target.distribute) {
      await fs.writeFile(`${target.outPath}.map`, result.sourceMap);
      this.emitter.emitForFile(EventType.WRITE_FILE, `${target.relPath}.map`);
    }
  }
}

export async function buildFile(
  filePath: string,
  distribute: boolean,
  force: boolean,
  config: Config,
  emitter: Emitter
) {
  const target = Target.getTarget(filePath, config, distribute);
  if (target.rule === null) {
    emitter.emitForLog('INFO', `skip: ${target.relPath}`);

    return;
  }

  const builder = Builder.getBuilder(
    target.rule.getBuilder(distribute),
    emitter
  );
  await builder.build(target, force);
}
