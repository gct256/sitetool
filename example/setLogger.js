function log(message, error) {
  if (error) {
    console.error(`[E] ${message}`);
    console.log('');
    console.error(error);
    console.log('');
  } else {
    console.log(`[I] ${message}`);
  }
}

function setLogger(runtime) {
  runtime.on('READY', ({ error }) => log('ready', error));
  runtime.on('OPENING', ({ error }) => log('opening', error));
  runtime.on('OPENED', ({ error }) => log('opened', error));
  runtime.on('CLOSING', ({ error }) => log('closing', error));
  runtime.on('CLOSED', ({ error }) => log('closed', error));
  runtime.on('WATCHER_STARTING', ({ error }) => log('watcher staring', error));
  runtime.on('WATCHER_STARTED', ({ error }) => log('watcher started', error));
  runtime.on('WATCHER_STOPPING', ({ error }) => log('watcher stopping', error));
  runtime.on('WATCHER_STOPPED', ({ error }) =>
    log('clowatcher stopped', error)
  );
  runtime.on('SERVER_STARTING', ({ error }) => log('server starting', error));
  runtime.on('SERVER_STARTED', ({ urls }) => {
    console.log(urls.get('local'));
    console.log(urls.get('external'));
  });
  runtime.on('SERVER_STOPPING', ({ error }) => log('server stopping', error));
  runtime.on('SERVER_STOPPED', ({ error }) => log('server stopped', error));
  runtime.on('PRE_BUILDING', ({ error }) => log('pre builting', error));
  runtime.on('PRE_BUILT', ({ error }) => log('pre built', error));
  runtime.on('CLEANING', ({ error }) => log('cleaning', error));
  runtime.on('CLEANED', ({ error }) => log('cleaned', error));
  runtime.on('DISTRIBUTING', ({ error }) => log('distributing', error));
  runtime.on('DISTRIBUTED', ({ dirPath, error }) =>
    log(`distributed: ${dirPath}`, error)
  );
  runtime.on('REMOVE_DIRECTORY', ({ relPath, error }) =>
    log(`RM -rf: ${relPath}`, error)
  );
  runtime.on('MAKE_DIRECTORY', ({ relPath, error }) =>
    log(`MKDIR -p: ${relPath}`, error)
  );
  runtime.on('WRITE_FILE', ({ relPath, error }) =>
    log(`WRITE: ${relPath}`, error)
  );
  runtime.on('SKIP_FILE', ({ relPath, error }) =>
    log(`SKIP: ${relPath}`, error)
  );
  runtime.on('TRANSFORM', ({ funcName, relPath, error }) =>
    log(`<${funcName}> ${relPath}`, error)
  );
  runtime.on('BROWSER_RELOADED', ({ error }) => log('-- RELOADED --', error));
  runtime.on('MESSAGE', (message) => console.log(message));
}

module.exports = setLogger;
