import * as path from 'path';

import * as fs from 'fs-extra';
import globby from 'globby';
import requireFromString from 'require-from-string';

import {
  getDefaultConfig,
  getDefaultDirectory,
  getDefaultRule,
  getDirectoryPath,
  getFallbackRule,
  getRule
} from '../utils/configUtils';
import { PRODUCTION, DEVELOPMENT } from '../utils';

import { Emitter } from './Emitter';
import { Rule } from './Rule';

const defaultConfigFile = 'sitetool.config.js';

export interface ConfigData {
  directory?: {
    src?: string;
    work?: string;
    dist?: string;
  };
  rule?: ConfigRuleData[];
  option?: { [key: string]: any };
}

export interface ConfigRuleData {
  name?: string;
  pattern?: RegExp | RegExp[];
  ignore?: RegExp | RegExp[];
  trigger?: RegExp | RegExp[];
  extname?: string | null;
  func?:
    | string
    | string[]
    | {
        work?: string | string[];
        dist?: string | string[];
      };
}

export interface ConfigDirectory {
  src: string;
  work: string;
  dist: string;
}

export interface ConfigFunc {
  work: string[];
  dist: string[];
}

/**
 * Config class
 */
export class Config {
  public readonly directory: ConfigDirectory;

  private root: string;

  private configFile: string | null;

  private ruleArray: Rule[];

  private optionMap: { [key: string]: any };

  private loaded: boolean;

  private readonly emitter: Emitter;

  constructor(emitter: Emitter) {
    this.root = '';
    this.configFile = '';
    this.directory = getDefaultDirectory('');
    this.ruleArray = [];
    this.optionMap = {};

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

    if (await fs.pathExists(config)) {
      this.emitter.emit('MESSAGE', `load directory with ${config}`);
      await this.load(dirPath, config);
    } else {
      this.emitter.emit(
        'MESSAGE',
        `load directory without config (use default config): ${dirPath}`
      );

      await this.load(dirPath, null);
    }
  }

  public async loadConfigFile(filePath: string) {
    if (this.loaded) await this.unload();

    const root: string = path.dirname(filePath);

    if (!(await fs.pathExists(filePath))) {
      this.emitter.emit('MESSAGE', `config file not found: ${filePath}`);
      this.emitter.emit('MESSAGE', 'use default config');

      return this.loadDirectory(root);
    }

    await this.load(root, filePath);
  }

  public async unload() {
    this.root = '';
    this.configFile = '';
    Object.assign(this.directory, getDefaultDirectory(''));
    this.ruleArray = [];

    this.emitter.emit('MESSAGE', 'config unload');
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

  public getTriggerRule(filePath: string): Rule | null {
    const basename: string = path.basename(filePath);

    for (const rule of this.ruleArray) {
      switch (rule.testTrigger(basename)) {
        case 'match':
          return rule;

        default:
      }
    }

    return null;
  }

  public getOption<T>(name: string, forDistribute: boolean = false): T {
    if (!(name in this.optionMap)) return <T>{};

    const option = this.optionMap[name];

    if (typeof option !== 'object' || option === null) return <T>{};

    const prod = PRODUCTION in option ? option[PRODUCTION] : {};
    const devl = DEVELOPMENT in option ? option[DEVELOPMENT] : {};
    const result: { [key: string]: any } = {};
    const overwrite = forDistribute ? prod : devl;

    Object.entries(option).forEach(([key, value]: [string, any]) => {
      if (key !== PRODUCTION && key !== DEVELOPMENT) {
        result[key] = value;
      }
    });

    if (typeof overwrite === 'object' && overwrite !== null) {
      return <T>{
        ...result,
        ...overwrite
      };
    }

    return <T>result;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public async getAllSrcFiles(): Promise<string[]> {
    return globby(path.join(this.directory.src, '**', '*'));
  }

  private async load(root: string, configFile: string | null) {
    this.root = root;
    this.configFile = configFile;
    Object.assign(this.directory, getDefaultDirectory(root));
    this.ruleArray = [];

    for (const ruleData of getDefaultRule()) {
      const rule = getRule(ruleData);

      if (rule !== null) this.ruleArray.push(rule);
    }

    let data: ConfigData;

    if (configFile !== null) {
      let tmp: any;

      try {
        tmp = requireFromString(await fs.readFile(configFile, 'utf8'));
      } catch (e) {
        tmp = null;
      }

      if (typeof tmp !== 'object' || tmp === null) {
        this.emitter.emit(
          'MESSAGE',
          `config file format invalid: ${configFile}`
        );
        this.emitter.emit('MESSAGE', 'use default config');
        data = getDefaultConfig(root);
      } else {
        const tmp2: Partial<ConfigData> = tmp;
        const defaultConfig = getDefaultConfig(root);

        data = {
          directory: {
            ...defaultConfig.directory,
            ...(typeof tmp2.directory === 'object' && tmp2.directory !== null
              ? tmp2.directory
              : {})
          },
          rule: Array.isArray(tmp2.rule) ? tmp2.rule : defaultConfig.rule,
          option: {
            ...defaultConfig.option,
            ...(typeof tmp2.option === 'object' && tmp2.option !== null
              ? tmp2.option
              : {})
          }
        };
        this.emitter.emit('MESSAGE', `load config file: ${configFile}`);
      }
    } else {
      data = getDefaultConfig(root);
    }

    const {directory} = data;

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
      this.emitter.emit('MESSAGE', 'config.directory not defined.');
      this.emitter.emit('MESSAGE', 'use default directory layout.');
    }

    const ruleArray = data.rule;

    if (Array.isArray(ruleArray)) {
      this.ruleArray.length = 0;

      for (const rule of ruleArray) {
        const r = getRule(rule);

        if (r !== null) this.ruleArray.push(r);
      }
    } else {
      this.emitter.emit('MESSAGE', 'config.rule not defined.');
      this.emitter.emit('MESSAGE', 'use default rule.');
    }

    this.ruleArray.push(getFallbackRule());

    const {option} = data;

    if (typeof option === 'object' && option !== null) {
      this.optionMap = JSON.parse(JSON.stringify(option));
    }

    this.loaded = true;
  }
}
