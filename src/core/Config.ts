import * as fs from 'fs-extra';
import * as path from 'path';
import * as requireFromString from 'require-from-string';

import {
  getDefaultConfig,
  getDefaultDirectory,
  getDefaultRule,
  getDirectoryPath,
  getRule
} from './configUtils';
import { Emitter } from './Emitter';
import { Rule } from './Rule';

const defaultConfigFile: string = 'sitetool.config.js';

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
  // tslint:disable-next-line:no-any
  // private optionMap: { [key: string]: any };

  private loaded: boolean;
  private readonly emitter: Emitter;

  constructor(emitter: Emitter) {
    this.root = '';
    this.configFile = '';
    this.directory = getDefaultDirectory('');
    this.ruleArray = [];
    // this.optionMap = {};

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

    const config = path.resolve(dirPath, defaultConfigFile);
    // tslint:disable-next-line:no-console
    if (await fs.pathExists(config)) {
      this.emitter.emitForLog('INFO', `load directory with ${config}`);
      await this.load(dirPath, config);
    } else {
      this.emitter.emitForLog(
        'INFO',
        `load directory without config (use default config): ${dirPath}`
      );

      await this.load(dirPath, null);
    }
  }

  public async loadConfigFile(filePath: string) {
    if (this.loaded) await this.unload();

    const root: string = path.dirname(filePath);

    if (!(await fs.pathExists(filePath))) {
      this.emitter.emitForLog('WARN', `config file not found: ${filePath}`);
      this.emitter.emitForLog('WARN', 'use default config');

      return this.loadDirectory(root);
    }

    await this.load(root, filePath);
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

  private async load(root: string, configFile: string | null) {
    this.root = root;
    this.configFile = configFile;
    Object.assign(this.directory, getDefaultDirectory(root));
    this.ruleArray = [];

    let data: ConfigData;
    if (configFile !== null) {
      // tslint:disable-next-line:no-any
      let tmp: any;
      try {
        tmp = requireFromString(await fs.readFile(configFile, 'utf8'));
      } catch (e) {
        tmp = null;
      }

      if (typeof tmp !== 'object' || tmp === null) {
        this.emitter.emitForLog(
          'WARN',
          `config file format invalid: ${configFile}`
        );
        this.emitter.emitForLog('WARN', 'use default config');
        data = getDefaultConfig(root);
      } else {
        data = tmp;
        this.emitter.emitForLog('INFO', `load config file: ${configFile}`);
      }
    } else {
      data = getDefaultConfig(root);
    }

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
