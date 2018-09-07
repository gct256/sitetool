export function foo(x) {
  const y = x * 2;

  return (() => y)();
}
