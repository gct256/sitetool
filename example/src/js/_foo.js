/**
 * ブロックコメント
 */
export function foo(x) {
  const y = x * 2;

  console.log('_foo');

  // 行コメント
  return (() => y)();
}
