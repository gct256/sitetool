const setLogger = require('./setLogger');
const { Runtime } = require('..');

async function distribute() {
  const runtime = new Runtime();
  setLogger(runtime);

  await runtime.openConfigFile('./sitetool.config.js');
  await runtime.distribute();
}

distribute().catch(console.error);
