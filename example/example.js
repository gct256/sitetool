const sitetool = require('..');

async function main() {
  const runtime = new sitetool.Runtime();

  runtime.on(sitetool.EventType.ALL, (...args) => console.log(args));

  await runtime.openDirectory('.');
  await runtime.distribute();
  await runtime.close();
}

main().catch(console.error);
