import * as path from 'path';
import { ConfigData, ConfigDirectory, ConfigFunc } from './Config';
import { Rule, RuleInterface } from './Rule';

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

export function getDefaultConfig(root: string): ConfigData {
  return {
    directory: getDefaultDirectory(root),
    rule: [
      {
        name: 'html',
        pattern: /\.html$/i,
        ignore: /^_/i,
        func: ['file-preprocess', 'html-format']
      },
      {
        name: 'sass',
        pattern: /\.(sass|scss)$/i,
        ignore: /^_/i,
        extname: '.css',
        func: ['sass-compile', 'css-postcss']
      },
      {
        name: 'js',
        pattern: /\.js$/i,
        ignore: /\.min\.js$/i,
        func: ['js-minify']
      },
      {
        name: 'image',
        pattern: /\.(gif|png|jpg|jpeg|svgz)$/i,
        func: ['image-minify']
      },
      {
        name: 'image+gzip',
        pattern: /\.(svg)$/i,
        extname: '.svgz',
        func: ['image-minify', 'file-gzip']
      }
    ],
    option: {
      'css-postcss': {
        autoprefixer: {
          browsers: ['> 5%', 'not dead']
        }
      },
      server: {
        port: 3000
      }
    }
  };
}

// tslint:disable-next-line:no-any
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

// tslint:disable-next-line:no-any
function getBuilderNameList(list: any): string[] {
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

// tslint:disable-next-line:no-any
function getBuilder(builder: any): ConfigFunc {
  const result: ConfigFunc = { work: [], dist: [] };

  if (
    typeof builder === 'object' &&
    !Array.isArray(builder) &&
    builder !== null
  ) {
    if ('work' in builder) result.work = getBuilderNameList(builder.work);
    if ('dist' in builder) result.dist = getBuilderNameList(builder.dist);
  } else {
    result.work = getBuilderNameList(builder);
    result.dist = [...result.work];
  }

  return result;
}

// tslint:disable-next-line:no-any
export function getRule(rule: any): Rule | null {
  if (typeof rule === 'object' && rule !== null) {
    const result: RuleInterface = {
      name: 'unknown',
      pattern: [],
      ignore: [],
      extname: null,
      builder: {
        work: [],
        dist: []
      }
    };

    if (typeof rule.name === 'string') result.name = rule.name;
    if ('pattern' in rule) result.pattern = getPattern(rule.pattern);
    if ('ignore' in rule) result.ignore = getPattern(rule.ignore);
    if (typeof rule.extname === 'string') result.extname = rule.extname;
    if ('builder' in rule) result.builder = getBuilder(rule.builder);

    return new Rule(result);
  }

  return null;
}

export function getDefaultRule(): Rule {
  return new Rule({
    name: 'default',
    pattern: [],
    ignore: [],
    extname: null,
    builder: {
      work: [],
      dist: []
    }
  });
}
