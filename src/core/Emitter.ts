import { EventEmitter } from 'events';
import { Config } from './Config';

export type LogLevel =
  | 'ALL'
  | 'MARK'
  | 'TRACE'
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'ERROR'
  | 'FATAL'
  | 'OFF';

export interface RuntimeEvent {
  config: Config;
}

export interface FileEvent {
  relPath: string;
}

export interface TransformEvent {
  funcName: string;
  relPath: string;
}

export interface LogEvent {
  level: LogLevel;
  // tslint:disable-next-line:no-any
  args: any[];
}

export const EventType = {
  READY: 'READY',

  OPENING: 'OPENING',
  OPENED: 'OPENED',

  CLOSING: 'CLOSING',
  CLOSED: 'CLOSED',

  WATCHER_STARTING: 'WATCHER_STARTING',
  WATCHER_STARTED: 'WATCHER_STARTED',
  WATCHER_STOPPING: 'WATCHER_STOPPING',
  WATCHER_STOPPED: 'WATCHER_STOPPED',

  SERVER_STARTING: 'SERVER_STARTING',
  SERVER_STARTED: 'SERVER_STARTED',
  SERVER_STOPPING: 'SERVER_STOPPING',
  SERVER_STOPPED: 'SERVER_STOPPED',

  PRE_BUILDING: 'PRE_BUILDING',
  PRE_BUILT: 'PRE_BUILT',
  CLEANING: 'CLEANING',
  CLEANED: 'CLEANED',
  DISTRIBUTING: 'DISTRIBUTING',
  DISTRIBUTED: 'DISTRIBUTED',

  REMOVE_DIRECTORY: 'REMOVE_DIRECTORY',
  MAKE_DIRECTORY: 'MAKE_DIRECTORY',
  WRITE_FILE: 'WRITE_FILE',

  TRANSFORM: 'TRNASFORM',

  BROWSER_RELOADED: 'BROWSER_RELOADED',

  LOG: 'LOG',

  ALL: 'ALL'
};

export class Emitter extends EventEmitter {
  // tslint:disable-next-line:no-any
  public emit(event: string | symbol, ...args: any[]): boolean {
    if (event !== EventType.ALL) super.emit(EventType.ALL, event, ...args);

    return super.emit(event, ...args);
  }

  public emitForRuntime(eventType: string | symbol, config: Config) {
    this.emit(eventType, { config });
  }

  public emitForFile(eventType: string | symbol, relPath: string) {
    this.emit(eventType, { relPath });
  }

  public emitForTransform(funcName: string, relPath: string) {
    this.emit(EventType.TRANSFORM, { funcName, relPath });
  }

  // tslint:disable-next-line:no-any
  public emitForLog(level: LogLevel, ...args: any[]) {
    this.emit(EventType.LOG, { level, args });
  }
}
