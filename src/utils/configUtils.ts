import * as path from 'path';
import {
  ConfigData,
  ConfigDirectory,
  ConfigFunc,
  ConfigRuleData
} from '../core/Config';
import { Rule, RuleInterface } from '../core/Rule';

export function getDirectoryPath(
  root: string,
  filePath: string,
  key: string
): string {
  const result: string = path.resolve(root, filePath);
  if (/\.\./.test(path.relative(root, result))) {
    throw new Error(`config.directory.${key} must be under root`);
  }

  return result;
}

export function getDefaultDirectory(root: string): ConfigDirectory {
  return {
    src: getDirectoryPath(root, 'src', 'src'),
    work: getDirectoryPath(root, 'work', 'work'),
    dist: getDirectoryPath(root, 'dist', 'dist')
  };
}

export function getDefaultRule(): ConfigRuleData[] {
  return [
    {
      name: 'copy minified',
      pattern: [/\.min\.js$/i, /\.min\.css$/i],
      ignore: /^_/i,
      func: []
    },
    {
      name: 'html',
      pattern: /\.html$/i,
      ignore: /^_/i,
      trigger: /\.html$/i,
      func: ['file-preprocess', 'html-format']
    },
    {
      name: 'sass',
      pattern: /\.(sass|scss)$/i,
      ignore: /^_/i,
      trigger: /\.(sass|scss)$/,
      extname: '.css',
      func: ['sass-compile', 'css-postcss', 'css-format']
    },
    {
      name: 'js',
      pattern: /\.js$/i,
      ignore: /^_/i,
      trigger: /\.js$/i,
      func: ['js-bundle', 'js-format']
    },
    {
      name: 'image',
      pattern: /\.(gif|png|jpg|jpeg|webp|svgz)$/i,
      func: 'image-minify'
    },
    {
      name: 'image+gzip',
      pattern: /\.(svg)$/i,
      extname: '.svgz',
      func: ['image-minify', 'file-gzip']
    }
  ];
}

export function getDefaultConfig(root: string): ConfigData {
  return {
    directory: getDefaultDirectory(root),
    rule: getDefaultRule(),
    option: {
      'css-postcss': {
        autoprefixer: {
          browsers: ['> 5%', 'not dead']
        }
      },
      'js-bundle': {
        browsers: ['> 5%', 'not dead']
      },
      'html-format': {
        indent_size: 2,
        indent_with_tabs: false,
        eol: '\n',
        end_with_newline: true,
        preserve_newlines: true,
        max_preserve_newlines: 1,
        indent_inner_html: false
      },
      server: {
        port: 3000
      }
    }
  };
}

function getPattern(pattern: any): RegExp[] {
  if (pattern instanceof RegExp) return [pattern];

  if (Array.isArray(pattern)) {
    const result: RegExp[] = [];
    for (const x of pattern) {
      if (x instanceof RegExp) result.push(x);
    }

    return result;
  }

  return [];
}

function getFuncNameList(list: any): string[] {
  if (typeof list === 'string') return [list];

  if (Array.isArray(list)) {
    const result: string[] = [];
    for (const x of list) {
      if (typeof x === 'string') result.push(x);
    }

    return result;
  }

  return [];
}

function getFunc(func: any): ConfigFunc {
  const result: ConfigFunc = { work: [], dist: [] };

  if (typeof func === 'object' && !Array.isArray(func) && func !== null) {
    if ('work' in func) result.work = getFuncNameList(func.work);
    if ('dist' in func) result.dist = getFuncNameList(func.dist);
  } else {
    result.work = getFuncNameList(func);
    result.dist = [...result.work];
  }

  return result;
}

export function getRule(rule: any): Rule | null {
  if (typeof rule === 'object' && rule !== null) {
    const result: RuleInterface = {
      name: 'unknown',
      pattern: [],
      ignore: [],
      trigger: [],
      extname: null,
      func: {
        work: [],
        dist: []
      }
    };

    if (typeof rule.name === 'string') result.name = rule.name;
    if ('pattern' in rule) result.pattern = getPattern(rule.pattern);
    if ('ignore' in rule) result.ignore = getPattern(rule.ignore);
    if ('trigger' in rule) result.trigger = getPattern(rule.trigger);
    if (typeof rule.extname === 'string') result.extname = rule.extname;
    if ('func' in rule) result.func = getFunc(rule.func);

    return new Rule(result);
  }

  return null;
}

export function getFallbackRule(): Rule {
  return new Rule({
    name: 'default',
    pattern: [],
    ignore: [],
    trigger: [],
    extname: null,
    func: {
      work: [],
      dist: []
    }
  });
}
