import { EventEmitter } from 'events';

export interface RuntimeEvent {
  error: Error | false;
}

export interface FileEvent {
  relPath: string;
  error: Error | false;
}

export interface TransformEvent {
  funcName: string;
  relPath: string;
  error: Error | false;
}

export interface ServerStartedEvent {
  port: number;
  urls: Map<string, string>;
  error: Error | false;
}

export interface DistributeEvent {
  dirPath: string;
  error: Error | false;
}

export interface EventMap {
  READY: RuntimeEvent;

  OPENING: RuntimeEvent;
  OPENED: RuntimeEvent;

  CLOSING: RuntimeEvent;
  CLOSED: RuntimeEvent;

  WATCHER_STARTING: RuntimeEvent;
  WATCHER_STARTED: RuntimeEvent;
  WATCHER_STOPPING: RuntimeEvent;
  WATCHER_STOPPED: RuntimeEvent;

  SERVER_STARTING: RuntimeEvent;
  SERVER_STARTED: ServerStartedEvent;
  SERVER_STOPPING: RuntimeEvent;
  SERVER_STOPPED: RuntimeEvent;

  BUILDING: RuntimeEvent;
  BUILT: RuntimeEvent;
  CLEANING: RuntimeEvent;
  CLEANED: RuntimeEvent;
  DISTRIBUTING: RuntimeEvent;
  DISTRIBUTED: DistributeEvent;

  REMOVE_DIRECTORY: FileEvent;
  MAKE_DIRECTORY: FileEvent;
  WRITE_FILE: FileEvent;
  SKIP_FILE: FileEvent;

  TRANSFORM: TransformEvent;

  BROWSER_RELOADED: RuntimeEvent;

  MESSAGE: string;
}

/**
 * Emitter class
 */
export class Emitter {
  private rawEmitter: EventEmitter = new EventEmitter();

  public on<K extends keyof EventMap>(
    event: K,
    listener: (arg: EventMap[K]) => void
  ): this {
    this.rawEmitter.on(event, listener);

    return this;
  }

  public once<K extends keyof EventMap>(
    event: K,
    listener: (arg: EventMap[K]) => void
  ): this {
    this.rawEmitter.once(event, listener);

    return this;
  }

  public off<K extends keyof EventMap>(
    event: K,
    listener: (arg: EventMap[K]) => void
  ): this {
    this.rawEmitter.removeListener(event, listener);

    return this;
  }

  public emit<K extends keyof EventMap>(event: K, arg: EventMap[K]): this {
    this.rawEmitter.emit(event, arg);

    return this;
  }
}
