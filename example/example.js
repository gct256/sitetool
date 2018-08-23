const sitetool = require('..');

async function main() {
  const runtime = new sitetool.Runtime();

  runtime.on(sitetool.EventType.ALL, (...args) => console.log(args));

  await runtime.openDirectory('.');
  await runtime.preBuild();
  await runtime.startWatcher();
  await runtime.startServer();
}

main().catch(console.error);
