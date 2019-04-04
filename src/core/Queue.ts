export class Queue<K, T> {
  private readonly callback: (items: T[]) => void;
  private readonly delay: number;
  private readonly items: Map<K, T>;
  private timer: NodeJS.Timeout | null;

  constructor(callback: (items: T[]) => void, delay: number = 50) {
    this.callback = callback;
    this.delay = delay;
    this.items = new Map<K, T>();
    this.timer = null;
  }

  public add(key: K, item: T) {
    this.clearTimer();
    this.items.set(key, item);
    this.timer = global.setTimeout(() => this.run(), this.delay);
  }

  public clear() {
    this.clearTimer();
    this.items.clear();
  }

  private clearTimer() {
    if (this.timer !== null) global.clearTimeout(this.timer);
    this.timer = null;
  }

  private run() {
    this.timer = null;
    this.callback([...this.items.values()]);
    this.items.clear();
  }
}
