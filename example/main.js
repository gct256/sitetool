const setLogger = require('./setLogger');
const { Runtime } = require('..');

async function main() {
  const runtime = new Runtime();
  setLogger(runtime);

  // await runtime.openDirectory('.');
  await runtime.openConfigFile('./sitetool.config.js');
  await runtime.build();
  await runtime.startWatcher();
  await runtime.startServer();
}

main().catch(console.error);
