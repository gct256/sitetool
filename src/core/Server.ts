import { BrowserSyncInstance, Options, create } from 'browser-sync';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';

import { Config } from './Config';
import { Emitter } from './Emitter';

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

/**
 * Server class
 */
export class Server {
  private emitter: Emitter;
  private server: BrowserSyncInstance | null;
  private busy: boolean;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
    this.server = null;
    this.busy = false;
  }

  public async start(config: Config) {
    return new Promise(
      async (resolve: () => void, reject: (error: Error) => void) => {
        if (this.server !== null) await this.stop();

        this.emitter.emit('SERVER_STARTING', { error: false });
        this.busy = true;
        const server = create('server');
        this.server = server;

        const option: Options = {
          open: false,
          logLevel: 'silent',
          reloadDebounce: 500,
          ...config.getOption('server')
        };
        if (!('proxy' in option)) {
          option.server = config.directory.work;
        }

        const files: string[] = [path.join(config.directory.work, '**', '*')];
        if ('files' in option) {
          if (Array.isArray(option.files)) {
            for (const x of option.files) {
              if (typeof x === 'string') {
                files.push(x);
              }
            }
          } else if (typeof option.files === 'string') {
            files.push(option.files);
          }
        }

        server.init(
          {
            ...option,
            files,
            middleware: supportGzip
          },
          (error: Error) => {
            if (error !== undefined && error !== null) {
              this.emitter.emit('SERVER_STARTED', {
                port: -1,
                urls: new Map(),
                error
              });
              this.busy = false;
              reject(error);
            }
          }
        );
        server.emitter.on('init', () => {
          const port = server.getOption('port');
          const urls = server.getOption('urls');

          // tslint:disable-next-line: no-unsafe-any
          this.emitter.emit('SERVER_STARTED', { port, urls, error: false });
          this.busy = false;
          resolve();
        });
        // tslint:disable-next-line:no-any
        server.emitter.on('file:reload', ({ ext }: { ext: string }) => {
          if (ext === 'css') {
            this.emitter.emit('BROWSER_RELOADED', { error: false });
          }
        });
        server.emitter.on('browser:reload', () => {
          this.emitter.emit('BROWSER_RELOADED', { error: false });
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
        this.emitter.emit('SERVER_STOPPING', { error: false });
        this.server.emitter.on('service:exit', () => {
          this.emitter.emit('SERVER_STOPPED', { error: false });
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
