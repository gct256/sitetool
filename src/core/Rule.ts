export type RuleResult = 'match' | 'unmatch' | 'ignore';

export interface RuleInterface {
  name: string;
  pattern: RegExp[];
  ignore: RegExp[];
  trigger: RegExp[];
  extname: string | null;
  func: {
    work: string[];
    dist: string[];
  };
}

export class Rule implements RuleInterface {
  public readonly name: string;
  public readonly pattern: RegExp[];
  public readonly ignore: RegExp[];
  public readonly trigger: RegExp[];
  public readonly extname: string | null;
  public readonly func: {
    work: string[];
    dist: string[];
  };

  constructor({
    name,
    pattern,
    ignore,
    trigger,
    extname,
    func
  }: RuleInterface) {
    this.name = name;
    this.pattern = pattern;
    this.ignore = ignore;
    this.trigger = trigger;
    this.extname = extname;
    this.func = func;
  }

  public test(fileName: string): RuleResult {
    if (this.pattern.length === 0) {
      if (this.ignore.length === 0) return 'match';
      for (const re of this.ignore) {
        if (re.test(fileName)) return 'ignore';
      }

      return 'match';
    }

    for (const re of this.pattern) {
      if (re.test(fileName)) {
        if (this.ignore.length > 0) {
          for (const re2 of this.ignore) {
            if (re2.test(fileName)) return 'ignore';
          }
        }

        return 'match';
      }
    }

    return 'unmatch';
  }

  public getBuilder(distribute: boolean): string[] {
    return distribute ? this.func.dist : this.func.work;
  }
}
