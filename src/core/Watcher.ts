import { FSWatcher, watch } from 'chokidar';
import * as path from 'path';

import { buildFile } from './Builder';
import { Config } from './Config';
import { Emitter, EventType } from './Emitter';

export class Watcher {
  private emitter: Emitter;
  private watcher: FSWatcher | null;
  private busy: boolean;

  constructor(emitter: Emitter) {
    this.emitter = emitter;
    this.watcher = null;
    this.busy = false;
  }

  public async start(config: Config) {
    return new Promise(async (resolve: () => void) => {
      if (this.watcher !== null) await this.stop();

      this.emitter.emit(EventType.WATCHER_STARTING);
      this.busy = true;
      this.watcher = watch([path.join(config.directory.src, '**', '*')]);
      this.watcher.once('ready', () => {
        if (this.watcher === null) return;
        this.watcher.on('add', (filePath: string) =>
          buildFile(filePath, false, true, config, this.emitter)
        );
        this.watcher.on('change', (filePath: string) =>
          buildFile(filePath, false, true, config, this.emitter)
        );
        this.emitter.emit(EventType.WATCHER_STARTED);
        this.busy = false;
        resolve();
      });
    });
  }

  public async stop() {
    if (this.watcher !== null) {
      this.busy = true;
      this.emitter.emit(EventType.WATCHER_STOPPING);
      this.watcher.close();
      this.emitter.emit(EventType.WATCHER_STOPPED);
      this.busy = false;
      this.watcher = null;
    }
  }

  public isRunning(): boolean {
    return this.watcher !== null;
  }

  public isBusy(): boolean {
    return this.busy;
  }
}
