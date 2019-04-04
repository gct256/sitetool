import * as fs from 'fs-extra';
import globby from 'globby';
import * as path from 'path';

import { getFunc } from '../funcs/index';
import { Config } from './Config';
import { Emitter } from './Emitter';
import { Target } from './Target';
import { Queue } from './Queue';

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

/**
 * Builder class
 */
export class Builder {
  private emitter: Emitter;
  private funcNames: string[];
  private funcs: BuilderFunc[];

  private constructor(emitter: Emitter) {
    this.emitter = emitter;
    this.funcNames = [];
    this.funcs = [];
  }

  public static async getBuilder(funcNames: string[], emitter: Emitter) {
    const cachedBuilder = builderCache.get(funcNames);
    if (cachedBuilder !== undefined) return cachedBuilder;

    const builder = new Builder(emitter);
    await builder.init(funcNames);
    builderCache.set(funcNames, builder);

    return builder;
  }

  public async init(funcNames: string[]) {
    for (const funcName of funcNames) {
      const func = await getFunc(funcName);
      if (func !== undefined) {
        this.funcNames.push(funcName);
        this.funcs.push(func);
      }
    }
  }

  public async build(target: Target, force: boolean): Promise<void> {
    if (!force) {
      if (!(await isNeedUpdate(target.srcPath, target.outPath))) {
        return;
      }
    }

    const result: BuildContainer = await this.funcs.reduce(
      async (
        prev: Promise<BuildContainer>,
        func: BuilderFunc,
        index: number
      ): Promise<BuildContainer> => {
        return prev
          .then(async (container: BuildContainer) => {
            if (container.hasError) return container;

            const next = await func(container, target);
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
              buffer: Buffer.from(''),
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

interface BuildParameter {
  builder: Builder;
  target: Target;
  force: boolean;
}

const queue: Queue<string, BuildParameter> = new Queue(
  (items: BuildParameter[]) => {
    return items.reduce(
      (prev, { builder, target, force }) =>
        prev.then(() => builder.build(target, force)),
      Promise.resolve()
    );
  }
);

export async function buildFile(
  filePath: string,
  distribute: boolean,
  force: boolean,
  useTrigger: boolean,
  config: Config,
  emitter: Emitter
) {
  const target = Target.getTarget(filePath, config, distribute);
  if (target.rule !== null) {
    const builder = await Builder.getBuilder(
      target.rule.getBuilder(distribute),
      emitter
    );
    queue.add(target.relPath, { builder, target, force });

    return;
  }

  if (!useTrigger || target.triggerRule == null) return;

  const subBuilder = await Builder.getBuilder(
    target.triggerRule.getBuilder(distribute),
    emitter
  );

  for (const subFilePath of await globby(
    path.join(config.directory.src, '**', '*')
  )) {
    if (subFilePath === filePath) continue;
    const subTarget = Target.getTarget(subFilePath, config, distribute);
    if (
      subTarget.rule !== null &&
      subTarget.rule.name === target.triggerRule.name
    ) {
      queue.add(subTarget.relPath, {
        builder: subBuilder,
        target: subTarget,
        force: true
      });
    }
  }
}
