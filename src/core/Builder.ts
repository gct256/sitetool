import * as fs from 'fs-extra';
import * as path from 'path';

import { funcMap } from '../funcs';
import { Config } from './Config';
import { Emitter } from './Emitter';
import { Target } from './Target';

export interface BuildContainer {
  buffer: Buffer;
  sourceMap: Buffer | null;
  hasError: boolean;
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
  private funcNames: string[];
  private funcs: BuilderFunc[];

  private constructor(emitter: Emitter, funcNames: string[]) {
    this.emitter = emitter;
    this.funcNames = [];
    this.funcs = [];
    for (const funcName of funcNames) {
      const func = funcMap.get(funcName);
      if (func !== undefined) {
        this.funcNames.push(funcName);
        this.funcs.push(func);
      }
    }
  }

  public static getBuilder(funcNames: string[], emitter: Emitter) {
    const builder = builderCache.get(funcNames);

    return builder === undefined ? new Builder(emitter, funcNames) : builder;
  }

  public async build(target: Target, force: boolean): Promise<void> {
    if (!force) {
      if (!isNeedUpdate(target.srcPath, target.outPath)) {
        return;
      }
    }

    const result: BuildContainer = await this.funcs.reduce(
      (prev: Promise<BuildContainer>, func: BuilderFunc, index: number) => {
        return prev
          .then((container: BuildContainer) => {
            if (container.hasError) return container;

            const next = func(container, target);
            this.emitter.emit('TRANSFORM', {
              funcName: this.funcNames[index],
              relPath: target.relPath,
              error: false
            });

            return next;
          })
          .catch((error: Error) => {
            this.emitter.emit('TRANSFORM', {
              funcName: this.funcNames[index],
              relPath: target.relPath,
              error
            });

            return {
              buffer: new Buffer(''),
              sourceMap: null,
              hasError: true
            };
          });
      },
      Promise.resolve({
        buffer: await fs.readFile(target.srcPath),
        sourceMap: null,
        hasError: false
      })
    );

    if (result.hasError) return;

    const outDir = path.dirname(target.outPath);
    if (!(await fs.pathExists(outDir))) {
      await fs.mkdirp(outDir);
    }

    const relPath = target.relPath;
    try {
      await fs.writeFile(target.outPath, result.buffer);
      this.emitter.emit('WRITE_FILE', { relPath, error: false });
    } catch (error) {
      this.emitter.emit('WRITE_FILE', { relPath, error });
    }

    if (result.sourceMap !== null && !target.distribute) {
      const mapRelPath = `${target.relPath}.map`;
      try {
        await fs.writeFile(`${target.outPath}.map`, result.sourceMap);
        this.emitter.emit('WRITE_FILE', { relPath: mapRelPath, error: false });
      } catch (error) {
        this.emitter.emit('WRITE_FILE', { relPath: mapRelPath, error });
      }
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
    emitter.emit('SKIP_FILE', { relPath: target.relPath, error: false });

    return;
  }

  const builder = Builder.getBuilder(
    target.rule.getBuilder(distribute),
    emitter
  );
  await builder.build(target, force);
}
