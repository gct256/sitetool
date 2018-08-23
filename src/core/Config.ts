import * as fs from 'fs-extra';
import * as path from 'path';

import {
  getDefaultConfig,
  getDefaultDirectory,
  getDefaultRule,
  getDirectoryPath,
  getRule
} from './configUtils';
import { Emitter } from './Emitter';
import { Rule } from './Rule';

export interface ConfigData {
  directory?: {
    src?: string;
    work?: string;
    dist?: string;
  };
  rule?: {
    name?: string;
    pattern?: RegExp | RegExp[];
    ignore?: RegExp | RegExp[];
    extname?: string;
    builder?:
      | string
      | string[]
      | {
          work?: string | string[];
          dist?: string | string[];
        };
  }[];
}

export interface ConfigDirectory {
  src: string;
  work: string;
  dist: string;
}

export interface ConfigBuilder {
  work: string[];
  dist: string[];
}

export class Config {
  public readonly directory: ConfigDirectory;

  private root: string;
  private configFile: string | null;
  private ruleArray: Rule[];

  private loaded: boolean;
  private readonly emitter: Emitter;

  constructor(emitter: Emitter) {
    this.root = '';
    this.configFile = '';
    this.directory = getDefaultDirectory('');
    this.ruleArray = [];

    this.loaded = false;
    this.emitter = emitter;
  }

  public async loadDirectory(dirPath: string) {
    if (this.loaded) await this.unload();
    if (!(await fs.pathExists(dirPath))) {
      throw new Error(`root directory not found: ${dirPath}`);
    }
    if (!(await fs.stat(dirPath)).isDirectory()) {
      throw new Error(`not directory: ${dirPath}`);
    }

    this.emitter.emitForLog(
      'INFO',
      `load directory with default config: ${dirPath}`
    );

    this.load(dirPath, null, getDefaultConfig(dirPath));
  }

  public async loadConfigFile(filePath: string) {
    if (this.loaded) await this.unload();

    const root: string = path.dirname(filePath);

    if (!(await fs.pathExists(filePath))) {
      this.emitter.emitForLog('WARN', `config file not found: ${filePath}`);
      this.emitter.emitForLog('WARN', 'use default config');

      return this.loadDirectory(root);
    }

    // tslint:disable-next-line:non-literal-require no-any
    const data: any = require(filePath);

    if (typeof data !== 'object' || data === null) {
      this.emitter.emitForLog(
        'WARN',
        `config file format invalid: ${filePath}`
      );
      this.emitter.emitForLog('WARN', 'use default config');

      return this.loadDirectory(root);
    }

    this.emitter.emitForLog('INFO', `load config file: ${filePath}`);

    this.load(root, filePath, data);
  }

  public async unload() {
    this.root = '';
    this.configFile = '';
    Object.assign(this.directory, getDefaultDirectory(''));
    this.ruleArray = [];

    this.emitter.emitForLog('INFO', 'config unload');
    this.loaded = false;
  }

  public getRoot(): string {
    return this.root;
  }

  public getConfigFile(): string | null {
    return this.configFile;
  }

  public getOutDir(distribute: boolean): string {
    return distribute ? this.directory.dist : this.directory.work;
  }

  public getRule(filePath: string): Rule | null {
    const basename: string = path.basename(filePath);

    for (const rule of this.ruleArray) {
      switch (rule.test(basename)) {
        case 'match':
          return rule;
        case 'ignore':
          return null;
        default:
      }
    }

    return null;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  private load(root: string, configFile: string | null, data: ConfigData) {
    this.root = root;
    this.configFile = configFile;
    Object.assign(this.directory, getDefaultDirectory(root));
    this.ruleArray = [];

    const directory = data.directory;
    if (typeof directory === 'object' && directory !== null) {
      if (typeof directory.src === 'string') {
        this.directory.src = getDirectoryPath(root, directory.src, 'src');
      }
      if (typeof directory.work === 'string') {
        this.directory.work = getDirectoryPath(root, directory.work, 'work');
      }
      if (typeof directory.dist === 'string') {
        this.directory.dist = getDirectoryPath(root, directory.dist, 'dist');
      }
    } else {
      this.emitter.emitForLog('WARN', 'config.directory not defined.');
      this.emitter.emitForLog('WARN', 'use default directory layout.');
    }

    const ruleArray = data.rule;
    if (Array.isArray(ruleArray)) {
      for (const rule of ruleArray) {
        const r = getRule(rule);
        if (r !== null) this.ruleArray.push(r);
      }
    } else {
      this.emitter.emitForLog('WARN', 'config.rule not defined.');
    }

    this.ruleArray.push(getDefaultRule());

    this.loaded = true;
  }
}
