import { BrowserSyncInstance, create } from 'browser-sync';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';

import { Config } from './Config';
import { Emitter, EventType } from './Emitter';

function supportGzip(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url;
  if (url !== undefined) {
    if (/\.gz$/i.test(url) || /\.svgz$/i.test(url)) {
      res.setHeader('Content-Encoding', 'gzip');
    }
  }

  next();
}

export const ServerEvent = {
  BEFORE_START: 'BEFORE_START',
  AFTER_START: 'AFTER_START',
  BEFORE_STOP: 'BEFORE_STOP',
  AFTER_STOP: 'AFTER_STOP',
  RELOAD_BROWSER: 'RELOAD_BROWSER',
  ERROR: 'ERROR'
};

export class Server {
  private emitter: Emitter;
  private server: BrowserSyncInstance | null;
  private busy: boolean;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
    this.server = null;
    this.busy = false;
  }

  public start(config: Config) {
    return new Promise(
      async (resolve: () => void, reject: (error: Error) => void) => {
        if (this.server !== null) await this.stop();

        this.emitter.emit(EventType.SERVER_STARTING);
        this.busy = true;
        this.server = create('server');
        this.server.init(
          {
            server: config.directory.work,
            files: [path.join(config.directory.work, '**', '*')],
            open: false,
            logLevel: 'silent',
            reloadDebounce: 500,
            middleware: supportGzip
          },
          (error: Error) => {
            if (error) {
              this.emitter.emitForLog('ERROR', 'cannot start server');
              this.emitter.emitForLog('ERROR', error);
              this.busy = false;
              reject(error);
            }
          }
        );
        this.server.emitter.on('init', () => {
          this.emitter.emit(EventType.SERVER_STARTED);
          this.busy = false;
          resolve();
        });
        this.server.emitter.on('browser:reload', () => {
          this.emitter.emit(EventType.BROWSER_RELOADED);
        });
      }
    );
  }

  public async stop() {
    return new Promise((resolve: () => void) => {
      if (this.server === null) {
        resolve();
      } else {
        this.busy = true;
        this.emitter.emit(EventType.SERVER_STOPPING);
        this.server.emitter.on('service:exit', () => {
          this.emitter.emit(EventType.SERVER_STOPPED);
          this.server = null;
          this.busy = false;
          resolve();
        });
        this.server.exit();
      }
    });
  }

  public isRunning(): boolean {
    return this.server !== null;
  }

  public isBusy(): boolean {
    return this.busy;
  }
}
