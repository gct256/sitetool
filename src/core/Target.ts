import * as path from 'path';

import { Config } from './Config';
import { Rule } from './Rule';

function getOutPath(
  relPath: string,
  outDir: string,
  rule: Rule | null
): string {
  if (rule !== null && typeof rule.extname === 'string') {
    const {extname} = rule;

    const period: string = /\./.test(extname) ? '' : '.';
    const originalExtname: string = path.extname(relPath);
    const outPath: string = path.resolve(outDir, relPath);

    return path.resolve(
      path.dirname(outPath),
      `${path.basename(outPath, originalExtname)}${period}${extname}`
    );
  }

  return path.resolve(outDir, relPath);
}

const targetCache: [Map<string, Target>, Map<string, Target>] = [
  new Map(),
  new Map()
];

/**
 * Target class
 */
export class Target {
  public readonly config: Config;

  public readonly rule: Rule | null;

  public readonly triggerRule: Rule | null;

  public readonly relPath: string;

  public readonly srcPath: string;

  public readonly outPath: string;

  public readonly distribute: boolean;

  private constructor(filePath: string, config: Config, distribute: boolean) {
    this.config = config;
    this.rule = config.getRule(filePath);
    this.triggerRule = config.getTriggerRule(filePath);
    this.relPath = path.relative(config.directory.src, filePath);
    this.srcPath = filePath;
    this.outPath = getOutPath(
      this.relPath,
      config.getOutDir(distribute),
      this.rule
    );
    this.distribute = distribute;
  }

  public static getTarget(
    filePath: string,
    config: Config,
    distribute: boolean
  ) {
    const target = targetCache[distribute ? 1 : 0].get(filePath);

    if (target !== undefined) return target;

    return new Target(filePath, config, distribute);
  }
}
